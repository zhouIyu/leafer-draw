import { Pen, type IPointData } from "leafer-editor"
import GraphBase from "./base"

export default class GraphPen extends GraphBase {
  static name = 'graph_pen'
  type = GraphPen.name
  isUpSelect = false

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
}
