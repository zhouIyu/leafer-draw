import type { IUI } from 'leafer-editor'
import { UpdateGraphCommand } from '../command'
import type { Editor } from '../type'

type TextLike = IUI & { text?: string }

export default class TextChangeRecorder {
  private editor: Editor
  private editingTarget: TextLike | null = null
  private fromText: string | undefined

  constructor(editor: Editor) {
    this.editor = editor
  }

  onBeforeOpen(target: IUI) {
    const textTarget = target as TextLike
    this.editingTarget = textTarget
    this.fromText = textTarget.text
  }

  onBeforeClose(target: IUI) {
    const textTarget = target as TextLike
    if (!this.editingTarget || this.editingTarget !== textTarget) return
    if (this.editor.history.executing) return

    const oldText = this.fromText
    const newText = textTarget.text

    if (oldText === newText) {
      this.reset()
      return
    }

    const command = new UpdateGraphCommand(
      this.editor,
      [textTarget],
      [{ text: oldText }],
      [{ text: newText }]
    )
    this.editor.addHistory(command)
    this.reset()
  }

  private reset() {
    this.editingTarget = null
    this.fromText = undefined
  }
}

