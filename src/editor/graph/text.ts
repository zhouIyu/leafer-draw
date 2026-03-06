import { Text, type IPointData, type IUI, PointerEvent } from "leafer-editor"
import GraphBase from "./base"
import { AddGraphCommand } from "../command"

export default class GraphText extends GraphBase {
  static name = 'graph_text'
  type = GraphText.name

  protected create(point: IPointData): IUI {
    const text = new Text({
      editable: true,
      x: point.x,
      y: point.y,
      text: '双击编辑文本',
      fontSize: 16,
      fill: '#000',
      stroke: 'transparent',
    })
    return text
  }

  protected update(_item: IUI, _endPoint: IPointData): void {
    // 文本不需要实时更新，只需要在创建时设置初始位置
    // 文本内容编辑通过双击事件处理
  }

  init() {
    this.app.on(PointerEvent.DOWN, this.onDown)
  }

  destroy(): void {
    this.app.off(PointerEvent.DOWN, this.onDown)
  }

  protected onDown = (e: PointerEvent) => {
    const startPoint = e.getPagePoint()
    this.points.push(startPoint)
    this.graph = this.create(startPoint)
    this.app.tree.add(this.graph)
    this.app.editor.select(this.graph)

    const command = new AddGraphCommand(this.editor, this.graph!)
    this.editor.addHistory(command)
    this.editor.exec()
  }
}
