import { Line, type IPointData } from "leafer-editor";
import GraphBase from "./base";

export default class GraphLine extends GraphBase {
  static name = 'graph_line'
  type = GraphLine.name

  protected create(point: IPointData): Line {
    return new Line({
      editable: true,
      points: [point],
      width: 0,
      height: 0,
      ...this.attrs,
    })
  }

  protected update(endPoint: IPointData): void {
    this.points[1] = endPoint
    const startPoint = this.points[0]
    if (!startPoint) return
    (this.graph! as Line).set({ points: [startPoint, endPoint] })
  }
}
