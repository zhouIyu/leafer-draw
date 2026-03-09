import type { Editor } from '../type'
import { AddGraphCommand } from '../command'
import { type IUI, type IPointData, App, PointerEvent } from 'leafer-editor'
import type { GraphAttrs } from '../type'

export type ToolMode = 'drag' | 'oneClick' | 'freeDraw'

export default abstract class GraphBase {
  protected app: App
  protected editor: Editor
  protected isDrawing = false
  protected graph: IUI | null = null
  protected points: IPointData[] = []
  protected mode: ToolMode = 'drag'
  abstract type: string
  protected attrs: GraphAttrs = {}

  constructor(editor: Editor) {
    this.editor = editor
    this.app = editor.app
  }

  init() {
    this.app.on(PointerEvent.DOWN, this.onDownBound)
    this.app.on(PointerEvent.MOVE, this.onMoveBound)
    this.app.on(PointerEvent.UP, this.onUpBound)
  }

  destroy() {
    this.app.off(PointerEvent.DOWN, this.onDownBound)
    this.app.off(PointerEvent.MOVE, this.onMoveBound)
    this.app.off(PointerEvent.UP, this.onUpBound)
  }

  protected onDownBound = (evt: PointerEvent) => this.onDown(evt)
  protected onMoveBound = (evt: PointerEvent) => this.onMove(evt)
  protected onUpBound = (_: PointerEvent) => this.onUp()

  protected onDown(e: PointerEvent) {
    const startPoint = e.getPagePoint()
    this.points.push(startPoint)
    this.graph = this.create(startPoint)
    this.app.tree.add(this.graph)

    if (this.mode === 'oneClick') {
      this.finalizeCreation()
      return
    }

    this.isDrawing = true
  }

  protected onMove(e: PointerEvent) {
    if (!this.isDrawing) return
    const movePoint = e.getPagePoint()
    this.update(movePoint)
  }

  protected onUp() {
    if (!this.isDrawing) return
    this.finalizeCreation()
  }

  protected finalizeCreation() {
    const graph = this.graph
    if (!graph) return

    const command = new AddGraphCommand(this.editor, graph)
    this.editor.addHistory(command)

    if (this.mode !== 'freeDraw') {
      this.editor.exec()
      this.editor.app.editor.select(graph)
    }

    this.isDrawing = false
    this.graph = null
    this.points = []
  }

  setAttrs(attrs: Partial<GraphAttrs>) {
    this.attrs = {
      ...this.attrs,
      ...attrs,
    }
  }

  protected abstract create(point: IPointData): IUI
  protected abstract update(endPoint: IPointData): void
}
