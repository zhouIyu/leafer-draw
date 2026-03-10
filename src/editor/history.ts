import type { ICommand } from './type'

const MAX_HISTORY_SIZE = 100

export default class History {
  private undoStack: ICommand[] = []
  private redoStack: ICommand[] = []
  private isExecuting = false


  public addCommand(command: ICommand) {
    this.undoStack.push(command)
    if (this.undoStack.length > MAX_HISTORY_SIZE) {
      this.undoStack.shift()
    }
    this.redoStack = []
  }

  public undo() {
    if (this.isExecuting) return
    const command = this.undoStack.pop()
    if (!command) return

    this.isExecuting = true
    try {
      command.undo()
      this.redoStack.push(command)
    } finally {
      this.isExecuting = false
    }
  }

  public redo() {
    if (this.isExecuting) return
    const command = this.redoStack.pop()
    if (!command) return

    this.isExecuting = true
    try {
      command.execute()
      this.undoStack.push(command)
    } finally {
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

  public get executing() {
    return this.isExecuting
  }
}

