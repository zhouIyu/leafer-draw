import { type IAppConfig, App } from 'leafer-editor'
import History from './history'
import Graph from './graph'
import { DeleteGraphsCommand, UpdateGraphCommand } from './command'
import AddEvent from './event'

import type { ICommand, IPlugin, GraphLike, UpdatableLeafData } from './type'

export default class Editor {
  app: App
  history: History
  graph: Graph
  plugins: IPlugin[] = []
  private event: AddEvent
  private selectionListeners = new Set<(items: unknown[]) => void>()

  constructor(config: IAppConfig) {
    const app = new App({
      ...config,
    })
    this.app = app
    this.history = new History()
    this.graph = new Graph(this)
    this.event = new AddEvent(this)
  }

  use(plugin: IPlugin) {
    plugin.init(this.app)
    plugin.enable(true)
    this.plugins.push(plugin)
  }

  addHistory(command: ICommand) {
    if (!command) return
    if (this.history.executing) return
    this.history.addCommand(command)
  }

  undo() {
    this.history.undo()
  }

  redo() {
    this.history.redo()
  }

  remove() {
    const { editor } = this.app
    const selectedItems = editor.list
    if (selectedItems.length === 0) return

    const uniqueItems = Array.from(new Set(selectedItems))
    const command = new DeleteGraphsCommand(this, uniqueItems)
    command.execute()
    this.addHistory(command)
  }

  clear() {
    const { tree } = this.app
    const items = tree.children
    if (items.length === 0) return

    const uniqueItems = Array.from(new Set(items))
    const command = new DeleteGraphsCommand(this, uniqueItems)
    command.execute()
    this.addHistory(command)
  }

  exec(name: string = '') {
    this.graph.exec(name)
  }

  update(items: GraphLike[], fromAttrsList: Partial<UpdatableLeafData>[], toAttrsList: Partial<UpdatableLeafData>[]) {
    const command = new UpdateGraphCommand(this, items, fromAttrsList, toAttrsList)
    command.execute()
    this.addHistory(command)
  }

  getSelected() {
    const { editor } = this.app
    return Array.from(new Set(editor.list))
  }

  onSelectionChange(listener: (items: unknown[]) => void) {
    this.selectionListeners.add(listener)
    listener(this.getSelected())
    return () => {
      this.selectionListeners.delete(listener)
    }
  }

  notifySelectionChange() {
    const items = this.getSelected()
    for (const listener of this.selectionListeners) listener(items)
  }

  destroy() {
    this.history.destroy()
    this.graph.destroy()
    this.plugins.forEach(plugin => plugin.destroy())
    this.event.destroy()
    this.selectionListeners.clear()
  }
}
