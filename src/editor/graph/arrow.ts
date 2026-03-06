import { Arrow, type IPointData } from "leafer-editor"
import GraphBase from "./base"

export default class GraphArrow extends GraphBase {
  static name = 'graph_arrow'
  type = GraphArrow.name

  protected create(point: IPointData): Arrow {
    return new Arrow({
      editable: true,
      points: [point],
      width: 0,
      height: 0,
      endArrow: 'arrow',
      stroke: '#f00',
      strokeWidth: 2,
      fill: 'transparent'
    })
  }

  protected update(endPoint: IPointData): void {
    this.points[1] = endPoint
    const startPoint = this.points[0]
    if (!startPoint) return
      ; (this.graph! as Arrow).set({ points: [startPoint, endPoint] })
  }
}
