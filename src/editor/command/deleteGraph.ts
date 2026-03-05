import type { IUI, IGroup } from "leafer-editor"
import type { ICommand, Editor } from "../type"

type DeletedGraphSnapshot = {
  item: IUI
  parent: IGroup
  index: number
}

export default class DeleteGraphsCommand implements ICommand {
  private editor: Editor
  private snapshots: DeletedGraphSnapshot[]

  constructor(editor: Editor, graphs: IUI[]) {
    this.editor = editor
    this.snapshots = graphs
      .map((item) => {
        const parent = item.parent
        if (!parent) return null
        const index = parent.children.indexOf(item)
        return { item, parent, index: index < 0 ? parent.children.length : index }
      })
      .filter((item): item is DeletedGraphSnapshot => Boolean(item))
  }

  public execute(): void {
    for (const snapshot of this.snapshots) {
      snapshot.parent.remove(snapshot.item)
    }
    const { editor } = this.editor.app
    editor.cancel()
    editor.updateEditBox()
  }

  public undo(): void {
    const byParent = new Map<IGroup, DeletedGraphSnapshot[]>()
    for (const snapshot of this.snapshots) {
      const list = byParent.get(snapshot.parent)
      if (list) {
        list.push(snapshot)
      } else {
        byParent.set(snapshot.parent, [snapshot])
      }
    }

    for (const [parent, list] of byParent.entries()) {
      list.sort((a, b) => a.index - b.index)
      for (const snapshot of list) {
        parent.addAt(snapshot.item, snapshot.index)
      }
    }
  }
}
