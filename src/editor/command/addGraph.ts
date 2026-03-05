import type { IUI } from "leafer-editor"
import type { ICommand, Editor } from "../type"

export default class AddGraphCommand implements ICommand {
  private editor: Editor
  private graph: IUI

  constructor(editor: Editor, graphInstance: IUI) {
    this.editor = editor
    this.graph = graphInstance
  }

  public execute(): void {
    this.editor.app.tree!.add(this.graph)
  }

  public undo(): void {
    this.editor.app.tree!.remove(this.graph)
  }
}
