import type { ILeafData, IUI } from 'leafer-editor'
import { UpdateGraphCommand } from '../command'
import type { Editor } from '../type'

type TransformAttrs = Pick<ILeafData, 'x' | 'y' | 'width' | 'height' | 'scaleX' | 'scaleY' | 'rotation'>

export default class TransformRecorder {
  private editor: Editor
  private fromAttrs: Partial<TransformAttrs>[] = []
  private isModifying = false

  constructor(editor: Editor) {
    this.editor = editor
  }

  onSelect() {
    const { editor } = this.editor.app
    const selectedItems = editor.list
    if (selectedItems.length === 0) return

    this.fromAttrs = selectedItems.map((item: IUI) => this.getTransformAttributes(item))
  }

  onTransformChange() {
    this.isModifying = true
  }

  onPointerUpCommit() {
    if (!this.isModifying) return

    try {
      if (this.editor.history.executing) return

      const { editor } = this.editor.app
      const selectedItems = editor.list
      if (selectedItems.length === 0) return
      if (this.fromAttrs.length === 0) return

      const toAttrs = selectedItems.map((item: IUI) => this.getTransformAttributes(item))
      if (!this.hasChanged(this.fromAttrs, toAttrs)) return

      const command = new UpdateGraphCommand(this.editor, selectedItems, this.fromAttrs, toAttrs)
      this.editor.addHistory(command)
    } finally {
      this.isModifying = false
      this.fromAttrs = []
    }
  }

  private hasChanged(
    fromList: Partial<TransformAttrs>[],
    toList: Partial<TransformAttrs>[]
  ) {
    const len = Math.min(fromList.length, toList.length)
    for (let i = 0; i < len; i++) {
      const from = fromList[i]
      const to = toList[i]
      if (!from || !to) continue
      if (
        from.x !== to.x ||
        from.y !== to.y ||
        from.width !== to.width ||
        from.height !== to.height ||
        from.scaleX !== to.scaleX ||
        from.scaleY !== to.scaleY ||
        from.rotation !== to.rotation
      ) return true
    }
    return fromList.length !== toList.length
  }

  private getTransformAttributes(item: IUI): Partial<TransformAttrs> {
    const { x, y, width, height, scaleX, scaleY, rotation } = item
    return { x, y, width, height, scaleX, scaleY, rotation }
  }
}

