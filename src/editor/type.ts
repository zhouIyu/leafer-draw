import type { App, IUIInputData } from 'leafer-editor'
import Editor from './editor'

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

export type UpdatableLeafData = IUIInputData & { text?: string }
export type GraphAttrs = Pick<UpdatableLeafData, 'stroke' | 'strokeWidth' | 'fill' | 'fontSize'>
export type GraphLike = IUIInputData & {
  set: (attrs: Partial<UpdatableLeafData>) => void
}
