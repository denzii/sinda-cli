import StandardOut from "./standardOut";

export default class ShellResponse {
    exe: string;
    shell: string;
    std: StandardOut;
    executedAt: string;

    constructor(exe: string, shell: string, std: StandardOut) {
        this.exe = exe;
        this.shell = shell;
        this.std = std;
        this.executedAt = new Date().toLocaleTimeString();
    }
};
