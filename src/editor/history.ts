import type { ICommand } from './type'

export default class History {
  private undoStack: ICommand[] = []
  private redoStack: ICommand[] = []
  private isExecuting = false


  public addCommand(command: ICommand) {
    this.undoStack.push(command)
    this.redoStack = []
  }

  public undo() {
    if (this.isExecuting) return
    const command = this.undoStack.pop()
    if (command) {
      command.undo()
      this.redoStack.push(command)
      this.isExecuting = false
    }
  }

  public redo() {
    if (this.isExecuting) return
    const command = this.redoStack.pop()
    if (command) {
      command.execute()
      this.undoStack.push(command)
      this.isExecuting = false
    }
  }

  public destroy() {
    this.undoStack = []
    this.redoStack = []
  }

  public get canUndo() {
    return this.undoStack.length > 0
  }

  public get canRedo() {
    return this.redoStack.length > 0
  }
}

