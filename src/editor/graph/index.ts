import type { App } from 'leafer-editor'
import type { Editor } from '../type'
import type { UpdatableLeafData, GraphAttrs } from '../type'
import type GraphBase from './base'
import GraphRect from './rect'
import GraphCircle from './circle'
import GraphLine from './line'
import GraphArrow from './arrow'
import GraphText from './text'
import GraphPen from './pen'

const DEFAULT_GRAPH_ATTRS: GraphAttrs = {
  stroke: '#ff0000',
  strokeWidth: 2,
  fill: 'transparent',
  fontSize: 14,
  dashPattern: [],
  cornerRadius: 0,
}

export const GraphTypes = {
  Rect: GraphRect.name,
  Circle: GraphCircle.name,
  Line: GraphLine.name,
  Arrow: GraphArrow.name,
  Text: GraphText.name,
  Pen: GraphPen.name
} as const

export default class Graph {
  protected app: App
  protected editor: Editor
  protected graphs: Map<string, GraphBase> = new Map()
  protected currentGraph: GraphBase | null = null
  protected defaultAttrs: GraphAttrs = DEFAULT_GRAPH_ATTRS
  constructor(editor: Editor) {
    this.editor = editor
    this.app = editor.app
    this.init()
  }

  init() {
    this.register(new GraphRect(this.editor))
    this.register(new GraphCircle(this.editor))
    this.register(new GraphLine(this.editor))
    this.register(new GraphArrow(this.editor))
    this.register(new GraphText(this.editor))
    this.register(new GraphPen(this.editor))
  }

  register(graph: GraphBase) {
    this.graphs.set(graph.type, graph)
  }

  exec(name: string = '') {
    this.currentGraph?.destroy()
    const graph = this.graphs.get(name)
    const { editor } = this.app
    if (!graph) {
      this.destroy()
      editor.config.selector = true
      return
    }

    this.currentGraph = graph
    editor.config.selector = false
    graph.init()
    graph.setAttrs(this.defaultAttrs)
  }

  setAttrs(attrs: Partial<UpdatableLeafData>) {
    const next: Partial<GraphAttrs> = {}
    if (typeof attrs.stroke === 'string') next.stroke = attrs.stroke
    if (typeof attrs.fill === 'string') next.fill = attrs.fill
    if (typeof attrs.strokeWidth === 'number' && Number.isFinite(attrs.strokeWidth)) {
      next.strokeWidth = attrs.strokeWidth
    }
    if (typeof attrs.fontSize === 'number' && Number.isFinite(attrs.fontSize)) {
      next.fontSize = attrs.fontSize
    }
    if (
      Array.isArray(attrs.dashPattern) &&
      attrs.dashPattern.every(item => Number.isFinite(item) && item >= 0)
    ) {
      next.dashPattern = attrs.dashPattern
    }
    if (
      typeof attrs.cornerRadius === 'number' &&
      Number.isFinite(attrs.cornerRadius) &&
      attrs.cornerRadius >= 0
    ) {
      next.cornerRadius = attrs.cornerRadius
    }
    if (Object.keys(next).length === 0) return

    this.defaultAttrs = {
      ...this.defaultAttrs,
      ...next,
    }
    this.currentGraph?.setAttrs(next)
  }

  destroy() {
    this.currentGraph?.destroy()
  }
}
