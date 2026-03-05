import { App, PointerEvent, type IAppConfig, type ILeafData, type IUI } from 'leafer-ui'
import { EditorEvent, EditorMoveEvent, EditorScaleEvent, EditorRotateEvent } from '@leafer-in/editor'
import '@leafer-in/viewport'
import History from './history'
import Graph from './graph'
import { DeleteGraphsCommand, UpdateAttrsCommand, type ICommand } from './action'

export default class Editor {
  app: App
  history: History
  graph: Graph
  private fromAttrs: Partial<ILeafData>[] = []
  private isModifying = false
  constructor(config: IAppConfig) {
    const app = new App({
      ...config
    })
    this.app = app
    this.history = new History()
    this.graph = new Graph(this)
    this.initEvent()
  }

  private initEvent() {
    const { editor } = this.app

    // 监听选择事件，记录初始属性
    editor.on(EditorEvent.SELECT, () => {
      const selectedItems = editor.list
      if (selectedItems.length === 0) return

      this.fromAttrs = selectedItems.map(item => this.getTransformAttributes(item))
    })

    // 同时监听所有变换事件
    editor.on([
      EditorMoveEvent.MOVE,
      EditorScaleEvent.SCALE,
      EditorRotateEvent.ROTATE
    ], () => {
      this.isModifying = true
    })

    // 监听选择事件，处理变换结束
    editor.on(PointerEvent.UP, () => {
      if (this.isModifying) {
        this.handleTransformEnd()
        this.isModifying = false
      }
    })
  }

  // 处理变换结束
  private handleTransformEnd() {
    const { editor } = this.app
    const selectedItems = editor.list

    if (selectedItems.length === 0 || !this.fromAttrs || this.fromAttrs.length === 0) return

    const toAttrs = selectedItems.map(item => this.getTransformAttributes(item))
    // 创建并添加命令到历史记录
    const command = new UpdateAttrsCommand(this, selectedItems, this.fromAttrs, toAttrs)
    this.addHistory(command)

    // 重置初始属性
    this.fromAttrs = []
  }

  // 获取图形的变换属性
  private getTransformAttributes(item: IUI): Partial<ILeafData> {
    const { x, y, width, height, scaleX, scaleY, rotation } = item
    return { x, y, width, height, scaleX, scaleY, rotation }
  }

  addHistory(command: ICommand) {
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

  exec(name: string) {
    this.graph.exec(name)
  }

  destroy() {
    this.history.destroy()
    this.graph.destroy()
  }
}
