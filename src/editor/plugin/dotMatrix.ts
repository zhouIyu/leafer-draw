import { DotMatrix } from 'leafer-x-dot-matrix'
import { App } from 'leafer-editor'

export default class DotMatrixPlugin {
  dotMatrix: DotMatrix | undefined

  init(app: App) {
    this.dotMatrix = new DotMatrix(app)
  }
  enable(enabled: boolean) {
    this.dotMatrix!.enableDotMatrix(enabled)
  }
  destroy() {
    this.dotMatrix!.destroy()
  }
}
