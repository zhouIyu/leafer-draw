import { type ILeafData, type IUI } from 'leafer-editor'
import { EditorEvent, EditorMoveEvent, EditorScaleEvent, EditorRotateEvent, PointerEvent } from 'leafer-editor'
import type { Editor } from './type'
import { UpdateGraphCommand } from './command'

export default class AddEvent {
  private fromAttrs: Partial<ILeafData>[] = []
  private editor: Editor
  private isModifying = false

  constructor(editor: Editor) {
    this.editor = editor
    this.initEvent()
  }

  private initEvent() {
    const { editor } = this.editor.app

    // 监听选择事件，记录初始属性
    editor.on(EditorEvent.SELECT, () => {
      const selectedItems = editor.list
      if (selectedItems.length === 0) return

      this.fromAttrs = selectedItems.map((item: IUI) => this.getTransformAttributes(item))
    })

    // 同时监听所有变换事件
    editor.on([
      EditorMoveEvent.MOVE,
      EditorScaleEvent.SCALE,
      EditorRotateEvent.ROTATE
    ], () => {
      this.isModifying = true
    })

    // 监听选择事件，处理变换结束
    editor.on(PointerEvent.UP, () => {
      if (this.isModifying) {
        this.handleTransformEnd()
        this.isModifying = false
      }
    })
  }

  // 处理变换结束
  private handleTransformEnd() {
    const { editor } = this.editor.app
    const selectedItems = editor.list

    if (selectedItems.length === 0 || !this.fromAttrs || this.fromAttrs.length === 0) return

    const toAttrs = selectedItems.map(item => this.getTransformAttributes(item))
    // 创建并添加命令到历史记录
    const command = new UpdateGraphCommand(this.editor, selectedItems, this.fromAttrs, toAttrs)
    this.editor.addHistory(command)

    // 重置初始属性
    this.fromAttrs = []
  }

  // 获取图形的变换属性
  private getTransformAttributes(item: IUI): Partial<ILeafData> {
    const { x, y, width, height, scaleX, scaleY, rotation } = item
    return { x, y, width, height, scaleX, scaleY, rotation }
  }

  destroy() {
    const { editor } = this.editor.app
    // 清理事件监听器
    editor.off(EditorEvent.SELECT)
    editor.off(EditorMoveEvent.MOVE)
    editor.off(EditorScaleEvent.SCALE)
    editor.off(EditorRotateEvent.ROTATE)
    editor.off(PointerEvent.UP)
  }
}
