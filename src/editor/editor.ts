import { type IAppConfig, App, type IUI } from 'leafer-editor'
import History from './history'
import Graph from './graph'
import { AddGraphCommand, DeleteGraphsCommand, UpdateGraphCommand } from './command'
import AddEvent from './event'
import { getSelected, getSelectedGraphLike } from './utils/selection'
import { emitter, Events } from './event'

import type { ICommand, IPlugin, UpdatableLeafData } from './type'

export default class Editor {
  app: App
  history: History
  graph: Graph
  plugins: IPlugin[] = []
  private event: AddEvent
  private clipboard: IUI[] = []

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
    this.emitUIStateChange()
  }

  undo() {
    this.history.undo()
    this.emitUIStateChange()
  }

  redo() {
    this.history.redo()
    this.emitUIStateChange()
  }

  get canUndo() {
    return this.history.canUndo
  }

  get canRedo() {
    return this.history.canRedo
  }

  get hasClipboard() {
    return this.clipboard.length > 0
  }

  get hasSelection() {
    return getSelected(this).length > 0
  }

  get hasDrawable() {
    const { tree } = this.app
    return tree.children.length > 0
  }

  selectAll() {
    const { tree, editor } = this.app
    if (!tree || !editor) return
    const items = tree.children
    if (items.length === 0) return
    const allItems = Array.from(items)
    editor.select(allItems)
    this.emitSelectionChange()
  }

  remove() {
    const selectedItems = getSelected(this)
    if (selectedItems.length === 0) return

    const command = new DeleteGraphsCommand(this, selectedItems)
    this.execCommand(command)
    this.emitSelectionChange()
  }

  clear() {
    const { tree } = this.app
    const items = tree.children
    if (items.length === 0) return

    const uniqueItems = Array.from(new Set(items))
    const command = new DeleteGraphsCommand(this, uniqueItems)
    this.execCommand(command)
    this.emitSelectionChange()
  }

  copy() {
    const selectedItems = getSelected(this)
    if (selectedItems.length === 0) return
    this.clipboard = selectedItems.map(item => item.clone())
    this.emitUIStateChange()
  }

  paste() {
    if (this.clipboard.length === 0) return

    const offset = 20
    const newItems: IUI[] = []
    for (const item of this.clipboard) {
      const cloned = item.clone()
      if (cloned) {
        cloned.set({
          x: (cloned.x || 0) + offset,
          y: (cloned.y || 0) + offset,
        })
        newItems.push(cloned)
      }
    }

    if (newItems.length > 0) {
      const command = new AddGraphCommand(this, newItems)
      this.execCommand(command)
      this.app.editor.select(newItems)
      this.emitSelectionChange()
    }
  }

  exec(name: string = '') {
    this.graph.exec(name)
  }

  private execCommand(command: ICommand) {
    if (!command) return
    if (this.history.executing) return
    command.execute()
    this.addHistory(command)
  }

  updateAttrs(attrs: Partial<UpdatableLeafData>) {
    this.graph.setAttrs(attrs)
    const command = UpdateGraphCommand.buildUpdateCommand(this, getSelectedGraphLike(this), attrs)
    if (!command) return
    this.execCommand(command)
  }

  emitSelectionChange() {
    const items = getSelectedGraphLike(this)
    emitter.emit(Events.SELECTION_CHANGE, items)
    this.emitUIStateChange()
  }

  emitUIStateChange() {
    emitter.emit(Events.UI_STATE_CHANGE, {
      canUndo: this.canUndo,
      canRedo: this.canRedo,
      hasSelection: this.hasSelection,
      hasClipboard: this.hasClipboard,
      hasDrawable: this.hasDrawable,
    })
  }

  destroy() {
    this.history.destroy()
    this.graph.destroy()
    this.plugins.forEach(plugin => plugin.destroy())
    this.event.destroy()
  }
}
