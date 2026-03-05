import type { Editor } from '../type'
import { AddGraphCommand } from '../command'
import { type IUI, type IPointData, App, PointerEvent } from 'leafer-editor'

export default abstract class GraphBase {
  protected app: App
  protected editor: Editor
  protected isDrawing = false
  protected graph: IUI | null = null
  protected points: IPointData[] = []
  abstract type: string

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

  private onDown(e: PointerEvent) {
    this.isDrawing = true
    const startPoint = e.getPagePoint()
    this.points.push(startPoint)
    this.graph = this.createGraph(startPoint)
    this.app.tree.add(this.graph)
  }

  private onMove(e: PointerEvent) {
    if (!this.isDrawing) return
    const movePoint = e.getPagePoint()
    this.updateGraph(this.graph!, movePoint)
  }

  private onUp() {
    if (!this.isDrawing) return

    // 创建命令并添加到历史记录
    const command = new AddGraphCommand(this.editor, this.graph!)
    this.editor.addHistory(command)
    this.editor.exec()
    this.editor.app.editor.select(this.graph!)
    this.isDrawing = false
    this.graph = null
    this.points = []
  }

  protected abstract createGraph(point: IPointData): IUI
  protected abstract updateGraph(item: IUI, endPoint: IPointData): void
}
