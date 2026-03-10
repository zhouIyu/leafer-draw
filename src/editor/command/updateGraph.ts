import type { IUI } from "leafer-editor"
import type { Editor, ICommand, GraphLike, UpdatableLeafData } from "../type"



export default class UpdateGraphCommand implements ICommand {
  private editor: Editor
  private graphs: GraphLike[]
  private fromAttrsList: Partial<UpdatableLeafData>[]
  private toAttrsList: Partial<UpdatableLeafData>[]

  constructor(
    editor: Editor,
    graphs: GraphLike[],
    fromAttrsList: Partial<UpdatableLeafData>[],
    toAttrsList: Partial<UpdatableLeafData>[]
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
    if (!editor) return
    const validGraphs = this.graphs.filter((g): g is IUI => g !== null && g !== undefined)
    if (validGraphs.length === 0) return
    editor.select(validGraphs)
    editor.updateEditBox()
  }

  static buildUpdateCommand(editor: Editor, items: GraphLike[], attrs: Partial<UpdatableLeafData>) {
    if (items.length === 0) return null

    const keys = Object.keys(attrs) as (keyof UpdatableLeafData)[]
    if (keys.length === 0) return null

    const applicable = items.filter((item) => keys.every((key) => key in item))
    if (applicable.length === 0) return null

    const attrsRecord = attrs as Record<string, unknown>
    const hasChanged = applicable.some((item) =>
      keys.some((key) => item[key as string] !== attrsRecord[key as string])
    )
    if (!hasChanged) return null

    const fromAttrsList = applicable.map((item) => {
      const from: Record<string, unknown> = {}
      for (const key of keys) from[key as string] = item[key as string]
      return from as Partial<UpdatableLeafData>
    })
    const toAttrsList = applicable.map(() => ({ ...attrs }))
    return new UpdateGraphCommand(editor, applicable, fromAttrsList, toAttrsList)
  }
}
