import { Ruler } from 'leafer-x-ruler'
import { type App } from 'leafer-editor'


export default class RulerPlugin {
  ruler: Ruler | undefined
  init(app: App) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.ruler = new Ruler(app)
  }
  enable(enabled: boolean) {
    this.ruler!.changeEnabled(enabled)
  }
  destroy() {
    this.ruler!.dispose()
  }
}
