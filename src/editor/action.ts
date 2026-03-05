import type { IGroup, ILeafData, IUI } from 'leafer-ui'
import type Editor from './editor'

/**
 * 命令接口
 * 所有具体命令都必须实现这个接口
 */
export interface ICommand {
  /**
   * 执行命令
   */
  execute(): void
  /**
   * 撤销命令
   */
  undo(): void
}

/**
 * 添加图形的命令
 */
export class AddGraphCommand implements ICommand {
  private editor: Editor
  // 直接引用图形实例，而不是它的数据
  private graphInstance: IUI

  constructor(editor: Editor, graphInstance: IUI) {
    this.editor = editor
    this.graphInstance = graphInstance
  }

  /**
   * 执行：将图形添加到画布
   * 在重做（redo）时被调用
   */
  public execute(): void {
    this.editor.app.tree.add(this.graphInstance)
  }

  /**
   * 撤销：从画布中移除图形
   */
  public undo(): void {
    this.editor.app.tree.remove(this.graphInstance)
  }
}

/**
 * 更新图形一个或多个属性的命令
 */
export class UpdateAttrsCommand implements ICommand {
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

  /**
   * 执行：应用新的属性值
   */
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

  /**
   * 撤销：恢复到旧的属性值
   */
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

  /**
   * 更新选择状态
   */
  private updateSelection() {
    const { editor } = this.editor.app
    editor.select(this.graphs)
    editor.updateEditBox()
  }
}

type DeletedGraphSnapshot = {
  item: IUI
  parent: IGroup
  index: number
}

export class DeleteGraphsCommand implements ICommand {
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
