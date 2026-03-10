import { Snap } from 'leafer-x-easy-snap'
import { type App } from 'leafer-editor'
import type { IPlugin } from '../type'


export default class SnapPlugin implements IPlugin {
  snap: Snap | undefined

  init(app: App) {
    this.snap = new Snap(app)
  }
  enable(enabled: boolean) {
    if (!this.snap) return
    this.snap.enable(enabled)
  }
  destroy() {
    this.snap?.destroy()
    this.snap = undefined
  }
}
