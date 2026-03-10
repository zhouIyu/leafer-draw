import type { IUI } from "leafer-editor"
import type { ICommand, Editor } from "../type"

export default class AddGraphCommand implements ICommand {
  private editor: Editor
  private graphs: IUI[]

  constructor(editor: Editor, graphInstances: IUI | IUI[]) {
    this.editor = editor
    this.graphs = Array.isArray(graphInstances) ? graphInstances : [graphInstances]
  }

  public execute(): void {
    const tree = this.editor.app.tree
    if (!tree) return
    for (const graph of this.graphs) {
      tree.add(graph)
    }
  }

  public undo(): void {
    const tree = this.editor.app.tree
    if (!tree) return
    for (const graph of this.graphs) {
      tree.remove(graph)
    }
  }
}
