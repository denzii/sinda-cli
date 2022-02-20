import Executable, { ShellType } from './executable.js';
import * as child from "child_process";
import StandardOut from './standardOut.js';
import ShellResponse from './shellResponse.js';

export type ShellBuffer = string | Buffer | undefined;

export default class Shell {

    static RunSync: (commands: Executable[]) => ShellResponse[] = (commands: Executable[]) => {
        return commands.map(elem => {
            // if the shell is powershell, combine the arguments using semicolon
            // if the shell is bash, combine them using empty string
            const exeArguments = elem.target == ShellType.Powershell ? elem.arguments?.join(";"): elem.arguments.join(" ");
            // combine command with its arguments into a single string.
            // an example is: "ls -a" where "ls" is the exe and "-a" is the argument.
            const exe: string = `${elem.executable} ${exeArguments}`

            const exeOptions =  { shell: elem.target, stdio: "pipe" };

            // apply side-effect on the host machine using the target shell
            const stream: StandardOut =  Shell.invokeSync(exe, exeOptions);

            // map the execution details to an object which contains meaningful data
            return new ShellResponse(exe, elem.target, stream);
        });
    }

    private static invokeSync: (executable: string, executableOptions: {}) => StandardOut = (exe, executableOptions) => {
        try {
            const options = executableOptions
            const buffer: ShellBuffer = child.execSync(exe, options);
            return new StandardOut(buffer);
        }
        catch(e: any){
            return new StandardOut( undefined, String(e));
        }
    }

// 	static RunAsync: (commands: Executable[]) => void = (commands: Executable[]) => {
//         return commands.map(elem => {
//             // if the shell is powershell, combine the arguments using semicolon
//             // if the shell is bash, combine them using empty string
//             const exeArguments = elem.target == ShellType.Powershell ? elem.arguments?.join(";"): elem.arguments.join(" ");
//             // combine command with its arguments into a single string.
//             // an example is: "ls -a" where "ls" is the exe and "-a" is the argument.
//             const exe: string = `${elem.executable} ${exeArguments}`

//             const exeOptions =  { shell: elem.target, stdio: "pipe" };

//             // apply side-effect on the host machine using the target shell
//             const stream =  Shell.invokeAsync(exe, exeOptions);
// return
//             // map the execution details to an object which contains meaningful data
//             // return new ShellResponse(exe, elem.target, stream);
//         });
//     }

// 	private static invokeAsync: (executable: string, executableOptions: {}) => void = (exe, executableOptions) => {
//         try {
//             const options = executableOptions
//             const command = child.spawn(exe, options);


// 			let stdoutBuffer =
// 			command.stdout.on("data", (data:string) => console.log({data: data.toString()}));
// 			command.stderr.on("data", (data:string) => console.log({data: data.toString()}));

// 			command.on('exit', (code:number) => {
// 				// return new ShellResponse(undefined, String(code), undefined)
// 				console.log('child process exited with code ' + code.toString());
// 			  });
//             // return new StandardOut(buffer);
//         }
//         catch(e: any){
//             return new StandardOut( undefined, String(e));
//         }
//     }
}

