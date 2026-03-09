import { Text, type IPointData } from "leafer-editor"
import GraphBase from "./base"

export default class GraphText extends GraphBase {
  static name = 'graph_text'
  type = GraphText.name
  protected mode = 'oneClick' as const

  protected create(point: IPointData): Text {
    const text = new Text({
      editable: true,
      x: point.x,
      y: point.y,
      text: '双击编辑文本',
      ...this.attrs,
      stroke: 'transparent',
      fill: this.attrs.stroke as string,
    })
    return text
  }

  protected update(_endPoint: IPointData): void {
    // 文本不需要实时更新，只需要在创建时设置初始位置
    // 文本内容编辑通过双击事件处理
  }
}
