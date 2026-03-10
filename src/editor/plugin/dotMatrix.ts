import { DotMatrix } from 'leafer-x-dot-matrix'
import type { App } from 'leafer-editor'
import type { IPlugin } from '../type'

export default class DotMatrixPlugin implements IPlugin {
  dotMatrix: DotMatrix | undefined

  init(app: App) {
    this.dotMatrix = new DotMatrix(app)
  }
  enable(enabled: boolean) {
    if (!this.dotMatrix) return
    this.dotMatrix.enableDotMatrix(enabled)
  }

  destroy() {
    this.dotMatrix?.destroy()
    this.dotMatrix = undefined
  }
}
