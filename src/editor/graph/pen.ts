import { Pen, type IPointData, PointerEvent } from "leafer-editor"
import GraphBase from "./base"
import { AddGraphCommand } from "../command"

export default class GraphPen extends GraphBase {
  static name = 'graph_pen'
  type = GraphPen.name

  protected create(point: IPointData): Pen {
    const pen = new Pen({
      editable: true,
    })
    pen.setStyle({
      stroke: '#32cd79',
      strokeWidth: 6,
      strokeCap: 'round',
      strokeJoin: 'round'
    })
    pen.moveTo(point.x, point.y)
    return pen
  }

  protected update(endPoint: IPointData): void {
    (this.graph! as Pen).lineTo(endPoint.x, endPoint.y)
  }

  protected onDown(e: PointerEvent) {
    this.isDrawing = true
    const startPoint = e.getPagePoint()
    this.points = [startPoint]
    this.graph = this.create(startPoint)
    this.app.tree.add(this.graph)
  }

  protected onMove(e: PointerEvent) {
    if (!this.isDrawing || !this.graph) return
    const movePoint = e.getPagePoint()
    this.update(movePoint)
  }

  protected onUp() {
    if (!this.isDrawing || !this.graph) return

    const command = new AddGraphCommand(this.editor, this.graph!)
    this.editor.addHistory(command)
    // this.editor.exec()
    // this.app.editor.select(this.graph!)
    this.isDrawing = false
    this.graph = null
    this.points = []
  }
}
