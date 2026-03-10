import type { IUI } from 'leafer-editor'
import type { GraphLike } from '../type'

export function isGraphLike(item: unknown): item is GraphLike {
  if (!item || typeof item !== 'object') return false
  const record = item as Record<string, unknown>
  return typeof record['set'] === 'function'
}

export function getSelected(editor: { app: { editor: { list: Iterable<IUI> } } }): IUI[] {
  const { editor: editorInstance } = editor.app
  return Array.from(new Set(editorInstance.list))
}

export function getSelectedGraphLike(
  editor: { app: { editor: { list: Iterable<IUI> } } }
): GraphLike[] {
  return getSelected(editor).filter(isGraphLike)
}
