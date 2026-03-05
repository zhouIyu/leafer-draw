import { App, type IAppConfig } from 'leafer-ui'
import '@leafer-in/editor'
import '@leafer-in/viewport'
import History from './history'
import Graph from './graph'

export default class Editor {
  app: App
  history: History
  graph: Graph
  constructor(config: IAppConfig) {
    const app = new App({
      ...config
    })
    this.app = app
    this.history = new History(app)
    this.graph = new Graph(this)
  }

  exec(name: string) {
    this.graph.exec(name)
  }

  destroy() {
    this.history.destroy()
    this.graph.destroy()
  }
}
