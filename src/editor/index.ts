import Editor from "./editor"
export { GraphTypes } from "./graph"

export function initEditor(view: HTMLElement): Editor {
  const editor = new Editor({
    view,
    editor: {},
    tree: { type: 'design' },
    fill: '#f3f3f3'
  })

  return editor
}
