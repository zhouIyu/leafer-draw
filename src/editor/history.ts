import { App, type IUIInputData, PointerEvent, ChildEvent } from 'leafer-ui'
import { EditorMoveEvent, EditorRotateEvent, EditorScaleEvent, EditorSkewEvent } from '@leafer-in/editor'

export default class History {
  private app: App
  private undoStack: IUIInputData[][] = []
  private redoStack: IUIInputData[][] = []
  private isRendering = false
  private isModifying = false
  constructor(app: App) {
    this.app = app
    this.save()
    this.addEvent()
  }

  addEvent() {
    const { editor, tree } = this.app
    tree.on([ChildEvent.ADD, ChildEvent.REMOVE], () => {
      this.save()
    })
    editor.on([EditorMoveEvent.MOVE, EditorRotateEvent.ROTATE, EditorScaleEvent.SCALE, EditorSkewEvent.SKEW], () => {
      this.isModifying = editor.dragging
    })
    editor.on(PointerEvent.UP, () => {
      if (!this.isModifying) return
      this.save()
      this.isModifying = false
    })
  }

  public save() {
    if (this.isRendering) return false

    const json = this.app.tree.toJSON()
    const data = json.children as IUIInputData[]
    this.undoStack.push(data)
    this.redoStack = []
  }

  public undo() {

    if (this.undoStack.length < 2) return false
    this.isRendering = true

    const current = this.undoStack.pop()!
    this.redoStack.push(current)

    const prev = this.undoStack[this.undoStack.length - 1]!

    this.apply(prev)

    this.isRendering = false
    return true
  }

  public redo() {
    if (this.redoStack.length < 1) return false
    this.isRendering = true

    const next = this.redoStack.pop()!
    this.undoStack.push(next)

    this.apply(next)

    this.isRendering = false
    return true
  }

  private apply(data: IUIInputData[]) {
    console.log(data)
    this.app.tree.clear()
    if (data && Array.isArray(data)) {
      data.forEach((item) => {
        this.app.tree.add(item)
      })
    }
  }

  public get canUndo() {
    return this.undoStack.length > 1
  }

  public get canRedo() {
    return this.redoStack.length > 0
  }
}
