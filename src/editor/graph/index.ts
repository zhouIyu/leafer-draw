import type { App } from "leafer-ui"
import Editor from '../editor'
import type GraphBase from "./base"
import GraphRect from "./rect"
import GraphCircle from "./circle"
import GraphLine from "./line"

export const GraphTypes = {
  Rect: GraphRect.name,
  Circle: GraphCircle.name,
  Line: GraphLine.name
} as const

export default class Graph {
  protected app: App
  protected editor: Editor
  protected graphs: Map<string, GraphBase> = new Map()
  protected currentGraph: GraphBase | null = null
  constructor(editor: Editor) {
    this.editor = editor
    this.app = editor.app
    this.init()
  }

  init() {
    this.register(new GraphRect(this.editor))
    this.register(new GraphCircle(this.editor))
    this.register(new GraphLine(this.editor))
  }

  register(graph: GraphBase) {
    this.graphs.set(graph.type, graph)
  }

  exec(name: string = '') {
    this.currentGraph?.destroy()
    const graph = this.graphs.get(name)
    const { editor } = this.app
    if (!graph) {
      this.currentGraph = null
      editor.config.selector = true
      return
    }

    this.currentGraph = graph
    editor.config.selector = false
    graph.init()
  }

  destroy() {
    this.currentGraph?.destroy()
  }
}
