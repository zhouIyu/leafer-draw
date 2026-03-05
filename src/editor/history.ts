import type { ICommand } from './action.ts'

export default class History {
  private undoStack: ICommand[] = []
  private redoStack: ICommand[] = []
  private isExecuting = false

  /**
   * 添加一个新命令并执行它
   * @param command
   */
  public addCommand(command: ICommand) {
    this.undoStack.push(command)
    // 当添加新命令时，清空重做栈
    this.redoStack = []
    // 注意：命令的执行现在由外部调用者负责
    // command.execute()
  }

  /**
   * 撤销上一个命令
   */
  public undo() {
    if (this.isExecuting) return
    const command = this.undoStack.pop()
    if (command) {
      command.undo()
      this.redoStack.push(command)
      this.isExecuting = false
    }
  }

  /**
   * 重做上一个被撤销的命令
   */
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

