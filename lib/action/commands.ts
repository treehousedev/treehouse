
export interface Command {
  id: string;
  title?: string;
  category?: string;
  icon?: string;
  action: Function;
}

export class CommandRegistry {
  commands: { [index: string]: Command }

  constructor() {
    this.commands = {};
  }

  registerCommand(cmd: Command) {
    this.commands[cmd.id] = cmd;
  }

  executeCommand<T>(id: string, ...rest: any): Promise<T> {
    return new Promise((resolve) => {
      const ret = this.commands[id].action(...rest);
      resolve(ret);
    });
  }
}