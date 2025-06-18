import type { Command } from "@/pages/editor/commands/CommandInterface";

const MAX_COMMAND_COUNT = 25;

export class CommandHistory {
  private commandStack: Array<Command>;
  private redoStack: Array<Command>;

  constructor() {
    this.commandStack = [];
    this.redoStack = [];

  }

  addCommand(command: Command) {
    command.execute();
    this.removeFirstIfFull();
    this.commandStack.push(command);
    this.clearRedoStack();
  }

  undo() {
    if (this.commandStack.length > 0) {

      const command = this.commandStack.pop();

      if (command) {
        command?.undo();
        this.redoStack.push(command);
      }

    }
  }

  redo() {
    if (this.redoStack.length > 0) {

      const command = this.redoStack.pop();

      if (command) {
        command?.execute();
        this.commandStack.push(command);
      }

    }
  }

  private removeFirstIfFull() {
    if (this.commandStack.length >= MAX_COMMAND_COUNT) {
      const removedCommand = this.commandStack.shift();
      console.log(removedCommand);
      removedCommand?.destroy();
    }
  }

  private clearRedoStack() {
    for (const command of this.redoStack) {
      command.destroy();
    }
    this.redoStack = [];
  }

}
