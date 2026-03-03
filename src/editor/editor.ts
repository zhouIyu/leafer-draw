import { App, type IAppConfig, Rect } from 'leafer-ui'
import '@leafer-in/editor'
import '@leafer-in/viewport'
import History from './history'

export default class Editor {
  app: App
  history: History
  constructor(config: IAppConfig) {
    const app = new App({
      ...config,
      editor: {
      }
    })
    this.app = app
    this.history = new History(app)
  }

  addRect() {
    const rect = new Rect({
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: '#f00',
      editable: true
    })
    this.app.tree.add(rect)
  }

  removeRect() {
    const rect = this.app.editor.list[0]
    if (rect) {
      this.app.tree.remove(rect)
    }
  }

  undo() {
    this.history.undo()
  }

  redo() {
    this.history.redo()
  }
}
