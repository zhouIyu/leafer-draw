import { InnerEditorEvent, RenderEvent, EditorEvent, EditorMoveEvent, EditorScaleEvent, EditorRotateEvent, PointerEvent, ResizeEvent, LayoutEvent } from 'leafer-editor'
import type { Editor } from './type'
import { TransformRecorder, TextChangeRecorder } from './recorder'

export default class AddEvent {
  private editor: Editor
  private transformRecorder: TransformRecorder
  private textRecorder: TextChangeRecorder

  constructor(editor: Editor) {
    this.editor = editor
    this.transformRecorder = new TransformRecorder(editor)
    this.textRecorder = new TextChangeRecorder(editor)
    this.initEvent()
  }

  private initEvent() {
    const { editor, tree } = this.editor.app

    // 监听选择事件，记录初始属性
    editor.on(EditorEvent.SELECT, this.onSelect)

    // 同时监听所有变换事件
    editor.on(EditorMoveEvent.MOVE, this.onModify)
    editor.on(EditorScaleEvent.SCALE, this.onModify)
    editor.on(EditorRotateEvent.ROTATE, this.onModify)

    // 监听选择事件，处理变换结束
    editor.on(PointerEvent.UP, this.onPointerUp)

    // 文本内部编辑生命周期（用于记录文本内容变更）
    editor.on(InnerEditorEvent.BEFORE_OPEN, this.onBeforeInnerOpen)
    editor.on(InnerEditorEvent.BEFORE_CLOSE, this.onBeforeInnerClose)

    // 监听变换事件，更新渲染
    tree.on(ResizeEvent.RESIZE, this.onTreeLayout)
    tree.on(LayoutEvent.AFTER, this.onTreeLayout)
  }

  private onSelect = () => {
    this.transformRecorder.onSelect()
    this.editor.notifySelectionChange()
  }

  private onModify = () => this.transformRecorder.onTransformChange()

  private onPointerUp = () => this.transformRecorder.onPointerUpCommit()

  private onTreeLayout = () => {
    const { tree } = this.editor.app
    tree.emit(RenderEvent.END, { renderBounds: tree.canvas.bounds })
  }

  private onBeforeInnerOpen = (e: { editTarget: unknown }) => {
    if (!e?.editTarget) return
    // 文本元素在 Leafer 中同样是 IUI，包含 text 字段
    this.textRecorder.onBeforeOpen(e.editTarget as never)
  }

  private onBeforeInnerClose = (e: { editTarget: unknown }) => {
    if (!e?.editTarget) return
    this.textRecorder.onBeforeClose(e.editTarget as never)
  }

  destroy() {
    const { editor, tree } = this.editor.app
    // 清理事件监听器
    editor.off(EditorEvent.SELECT, this.onSelect)
    editor.off(EditorMoveEvent.MOVE, this.onModify)
    editor.off(EditorScaleEvent.SCALE, this.onModify)
    editor.off(EditorRotateEvent.ROTATE, this.onModify)
    editor.off(PointerEvent.UP, this.onPointerUp)
    editor.off(InnerEditorEvent.BEFORE_OPEN, this.onBeforeInnerOpen)
    editor.off(InnerEditorEvent.BEFORE_CLOSE, this.onBeforeInnerClose)
    tree.off(ResizeEvent.RESIZE, this.onTreeLayout)
    tree.off(LayoutEvent.AFTER, this.onTreeLayout)
  }
}
