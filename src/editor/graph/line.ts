import { Line, type IPointData, type IUI } from "leafer-ui";
import GraphBase from "./base";

export default class GraphLine extends GraphBase {
  static name = 'graph_line'
  type = GraphLine.name

  protected createGraph(point: IPointData): IUI {
    return new Line({
      editable: true,
      points: [point],
      width: 0,
      height: 0,
      stroke: '#f00',
      fill: 'transparent'
    })
  }

  protected updateGraph(item: IUI, endPoint: IPointData): void {
    this.points[1] = endPoint
    const startPoint = this.points[0]
    if (!startPoint) return
    item.set({ points: [startPoint, endPoint] })
  }
}
