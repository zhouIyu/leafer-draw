import { Rect, type IPointData, type IUI } from "leafer-editor"
import GraphBase from "./base"

export default class GraphRect extends GraphBase {
  static name = 'graph_rect'
  type = GraphRect.name

  protected create(point: IPointData): IUI {
    return new Rect({
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
    const dX = endX - startX
    const dY = endY - startY
    const width = Math.abs(dX)
    const height = Math.abs(dY)

    let x = 0, y = 0

    // 判断往哪个方向移动
    if (dX >= 0 && dY >= 0) {
      // 右下方向
      x = startX
      y = startY
    } else if (dX < 0 && dY >= 0) {
      // 左下方向
      x = startX + dX
      y = startY
    } else if (dX >= 0 && dY < 0) {
      // 右上方向
      x = startX
      y = startY + dY
    } else {
      // 左上方向
      x = startX + dX
      y = startY + dY
    }

    return {
      x,
      y,
      width,
      height,
    }
  }
}