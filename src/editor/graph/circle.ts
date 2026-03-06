import { Ellipse, type IPointData, type IUI } from "leafer-editor";
import GraphBase from "./base";


export default class GraphCircle extends GraphBase {
  static name = 'graph_circle'

  type = GraphCircle.name

  protected create(point: IPointData): Ellipse {
    return new Ellipse({
      editable: true,
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
      stroke: '#f00',
      fill: 'transparent'
    })
  }

  protected update(item: IUI, endPoint: IPointData): void {
    this.points[1] = endPoint
    const startPoint = this.points[0]
    if (!startPoint) return
    const { x, y, width, height } = this.calculateBounds()
    item.set({ x, y, width, height })
  }

  private calculateBounds() {
    const { x: startX, y: startY } = this.points[0]!
    const { x: endX, y: endY } = this.points[1]!
    const x = Math.min(startX, endX)
    const y = Math.min(startY, endY)
    const width = Math.abs(endX - startX)
    const height = Math.abs(endY - startY)
    return { x, y, width, height }
  }
}