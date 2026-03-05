import type { App } from "leafer-editor"
import Editor from "./editor"

export type { Editor }

export interface ICommand {
  execute(): void
  undo(): void
}

export interface IPlugin {
  init(app: App): void
  enable(enabled: boolean): void
  destroy(): void
}
