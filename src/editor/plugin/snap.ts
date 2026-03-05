import { Snap } from 'leafer-x-easy-snap'
import { type App } from 'leafer-editor'


export default class SnapPlugin {
  snap: Snap | undefined

  init(app: App) {
    this.snap = new Snap(app)
  }
  enable(enabled: boolean) {
    this.snap!.enable(enabled)
  }
  destroy() {
    this.snap!.destroy()
  }
}
