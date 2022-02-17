import { ShellBuffer } from "./shell.js";

export default class StandardOut {
    stdout?: string;
    stderr?:  string;

    constructor(stdout?: ShellBuffer, stderr?: ShellBuffer) {
        this.stdout = StandardOut.Sanitize(stdout);
        this.stderr = StandardOut.Sanitize(stderr);        
    }

    // handle falsy values
    static Sanitize: (buffer: ShellBuffer) => string | undefined = (buffer) => {
        const output = String(buffer).trim(); 
        const isOutputFalsy = (!output || !output.length || output === "undefined" || output === "null");

        return isOutputFalsy ? undefined : output
    }
}