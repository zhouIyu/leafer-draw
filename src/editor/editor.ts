import { type IAppConfig, App } from 'leafer-editor'
import History from './history'
import Graph from './graph'
import { DeleteGraphsCommand } from './command'
import AddEvent from './event'

import type { ICommand, IPlugin } from './type'

export default class Editor {
  app: App
  history: History
  graph: Graph
  plugins: IPlugin[] = []
  private event: AddEvent

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

  destroy() {
    this.history.destroy()
    this.graph.destroy()
    this.plugins.forEach(plugin => plugin.destroy())
    this.event.destroy()
  }
}
