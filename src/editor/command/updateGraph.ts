import type { ILeafData, IUI } from "leafer-editor"
import type { Editor, ICommand } from "../type"

export default class UpdateGraphCommand implements ICommand {
  private editor: Editor
  private graphs: IUI[]
  private fromAttrsList: Partial<ILeafData>[]
  private toAttrsList: Partial<ILeafData>[]

  constructor(
    editor: Editor,
    graphs: IUI[],
    fromAttrsList: Partial<ILeafData>[],
    toAttrsList: Partial<ILeafData>[]
  ) {
    this.editor = editor
    this.graphs = graphs
    this.fromAttrsList = fromAttrsList
    this.toAttrsList = toAttrsList
  }

  public execute(): void {
    for (let index = 0; index < this.graphs.length; index++) {
      const graph = this.graphs[index]
      const attrs = this.toAttrsList[index]
      if (!graph || !attrs) continue
      graph.set(attrs)
    }
    // 执行后重新选择图形
    this.updateSelection()
  }

  public undo(): void {
    for (let index = 0; index < this.graphs.length; index++) {
      const graph = this.graphs[index]
      const attrs = this.fromAttrsList[index]
      if (!graph || !attrs) continue
      graph.set(attrs)
    }
    // 撤销后重新选择图形
    this.updateSelection()
  }

  private updateSelection() {
    const { editor } = this.editor.app
    editor.select(this.graphs)
    editor.updateEditBox()
  }
}
