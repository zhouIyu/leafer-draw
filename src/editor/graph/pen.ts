import { Pen, type IPointData } from "leafer-editor"
import GraphBase from "./base"

export default class GraphPen extends GraphBase {
  static name = 'graph_pen'
  type = GraphPen.name
  protected mode = 'freeDraw' as const

  protected create(point: IPointData): Pen {
    const pen = new Pen({
      editable: true,
    })
    pen.setStyle({
      ...this.attrs,
      strokeCap: 'round',
      strokeJoin: 'round'
    })
    pen.moveTo(point.x, point.y)
    return pen
  }

  protected update(endPoint: IPointData): void {
    if (!this.graph) return
    (this.graph as Pen).lineTo(endPoint.x, endPoint.y)
  }
}
