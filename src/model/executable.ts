
export enum ShellType  {
    Powershell = "powershell.exe",
    Bash = "/bin/bash"
}

export interface Exe  {
    target: ShellType
    executable: string
    arguments: string[]
}

export default class Executable implements Exe {
    target: ShellType;
    executable: string;
    arguments: string[];

    constructor(target: ShellType, executable: string, args?: string[]) {
        this.target = target;
        this.executable = executable;
        this.arguments = args ?? [];
    }
}