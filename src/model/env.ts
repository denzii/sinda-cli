import * as path from 'path';
import * as os from "os";
import Executable, { Exe } from './executable.js';


export type EnvMeta = {
    hostConfigPath: string,
    stateCommand: Exe,
    hostPlatforms: HostPlatform[]
}
export enum Architecture {
    AMD,
    AMR
}
export enum ShellType  {
    Powershell = "powershell.exe",
    Bash = "/bin/bash"
}

export enum HostPlatform {
    Wsl =  "Wsl",
    Windows = "Windows",
    Unix= "Unix"
}

export default class Env {
    public static PSFuncPath: () => string = () => {
        return path.resolve(Env.getDirname(), "../../src/script/index.ps1").replace("\\C:", "");
    }
    public static HostConfigPath: () => string = () => {
        if (Env.isWindows()) return  "C:\\ProgramData\\sindagal\\"
        if (Env.isWsl()) return  "/mnt/c/ProgramData/sindagal/"
        return process.env.HOME + "/.local/share/";
    }

    public static Meta : () => EnvMeta =
    () => {

        const powershellFunctionsPath: string = Env.PSFuncPath();
        const hostConfigPath = Env.HostConfigPath();
        const isWindows = Env.isWindows();

        let availablePlatforms: HostPlatform[] = [];
        if (Env.isWsl()) availablePlatforms.push(HostPlatform.Windows, HostPlatform.Wsl);
        else if (isWindows) availablePlatforms.push(HostPlatform.Windows);
        else availablePlatforms.push(HostPlatform.Unix);

        // rework this if will be needed in the future, currently unused &  wont work with "."
        const configCommand = isWindows
        ? new Executable(ShellType.Powershell, ".", [powershellFunctionsPath, "Get-EnvState"])
        : new Executable(ShellType.Bash, "echo", ["hi"]); //unimplemented, this should point to the bash equivalent of "Get-EnvState"

        return {hostConfigPath, stateCommand: configCommand, hostPlatforms: availablePlatforms};
    }

    private static isWsl : () =>boolean = () => os.release().includes("WSL");
    private static isWindows : () =>boolean = () => os.platform() == "win32";
    private static getDirname: () => string =
	() => {
		return  path.dirname(import.meta.url.replace("file:///", "/"));
	}
}
