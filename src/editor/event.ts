import { RenderEvent, EditorEvent, EditorMoveEvent, EditorScaleEvent, EditorRotateEvent, PointerEvent, ResizeEvent, LayoutEvent } from 'leafer-editor'
import type { Editor } from './type'
import { TransformRecorder } from './recorder'

export default class AddEvent {
  private editor: Editor
  private transformRecorder: TransformRecorder

  constructor(editor: Editor) {
    this.editor = editor
    this.transformRecorder = new TransformRecorder(editor)
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

    // 监听变换事件，更新渲染
    tree.on(ResizeEvent.RESIZE, this.onTreeLayout)
    tree.on(LayoutEvent.AFTER, this.onTreeLayout)
  }

  private onSelect = () => this.transformRecorder.onSelect()

  private onModify = () => this.transformRecorder.onTransformChange()

  private onPointerUp = () => this.transformRecorder.onPointerUpCommit()

  private onTreeLayout = () => {
    const { tree } = this.editor.app
    tree.emit(RenderEvent.END, { renderBounds: tree.canvas.bounds })
  }

  destroy() {
    const { editor, tree } = this.editor.app
    // 清理事件监听器
    editor.off(EditorEvent.SELECT, this.onSelect)
    editor.off(EditorMoveEvent.MOVE, this.onModify)
    editor.off(EditorScaleEvent.SCALE, this.onModify)
    editor.off(EditorRotateEvent.ROTATE, this.onModify)
    editor.off(PointerEvent.UP, this.onPointerUp)
    tree.off(ResizeEvent.RESIZE, this.onTreeLayout)
    tree.off(LayoutEvent.AFTER, this.onTreeLayout)
  }
}
