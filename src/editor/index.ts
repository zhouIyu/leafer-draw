import Editor from "./editor"
export { GraphTypes } from "./graph"

import DotMatrix from "./plugin/dotMatrix"
// import RulerPlugin from "./plugin/ruler"
import SnapPlugin from "./plugin/snap"

export function initEditor(view: HTMLElement): Editor {
  const editor = new Editor({
    view,
    editor: {},
    tree: { type: 'design' },
    zoom: { min: 0.1, max: 20 },
    fill: '#f3f3f3',
  })

  // editor.use(new RulerPlugin())
  editor.use(new DotMatrix())
  editor.use(new SnapPlugin())

  return editor
}
