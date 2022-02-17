// import Questionnaire from "./questionnaire";
import os from "node:os"
import { Architecture } from "./env";

export type AddonState = { 
    hasGlyphs: boolean;
    isCascadiaCodeInstalled: boolean;
    isWindowsTerminalInstalled: boolean;
    isChocoInstalled: boolean; 
    isPoshGitInstalled: boolean; 
    isOhMyPoshInstalled: boolean;
};

export type Distro = "Debian" | "Ubuntu" | "Ubuntu-20.04" | "Ubuntu-18.0" | "Alpine";
export type WslState = {
    supportsWSL2: boolean, isVirtualMachineEnabled: boolean, isWslEnabled: boolean,
    distros: { defaultDistro: Distro; installedDistros: Distro[]; }
    defaultWslVersion: 1 | 2,
};

export  interface IFeatureState {
    key: string,
    value: string | number
    isActive: boolean,
}

export  interface IEnvState {
    [key: string]: any|IFeatureState | undefined,

    chocolatey: IFeatureState,
    windowsTerminal: IFeatureState,
    ohMyPosh: IFeatureState,
    cascadiaCode: IFeatureState,
    poshGit: IFeatureState,
    distro: IFeatureState,
    docker: IFeatureState,
    osArchitectureBits: IFeatureState |string,
    osVersion:IFeatureState | string,
    osArchitecture: IFeatureState |Architecture,
    addon: IFeatureState |AddonState,
    osBuild: IFeatureState |string, 
    wsl: IFeatureState |WslState
}

export default class State implements IEnvState {
    osArchitectureBits: string;
    osVersion: string;
    osArchitecture: Architecture;
    addon: AddonState;
    osBuild: string;

    constructor(osArchitectureBits: string, osVersion: string, osArchitecture: Architecture, addons: AddonState, osBuild: string, wslState: WslState) {
            this.osArchitectureBits= osArchitectureBits;
            this.osVersion= osVersion;
            this.osArchitecture= osArchitecture;
            this.addon= addons;
            this.osBuild= osBuild;
            // this.wsl = wslState;
            // this.platforms = os.platform()
            }
    [key: string]: any;
    chocolatey!: IFeatureState;
    windowsTerminal!: IFeatureState;
    ohMyPosh!: IFeatureState;
    cascadiaCode!: IFeatureState;
    poshGit!: IFeatureState;
    distro!: IFeatureState;
    docker!: IFeatureState;
    wsl!: IFeatureState | WslState;
    
    // static ToQuestionnaire: (state: IEnvState) => Questionnaire = (state) => {

       
        // const addonQuestions: Question[] = [];
        // if(state.addon.isWindowsTerminalInstalled) {
        //     let question = <Question>{ type: "list", name:"windows-terminal"  };
        //     addonQuestions.push(question);
        // }
        
        // const wslQuestions: Question[] = [];
        // if(state.wsl.supportsWSL2){
            
        // }
        // const questionnaire: Questionnaire = new Questionnaire();

        // return {}
    // };

}


// const getKeyValue = <U extends keyof T, T extends object>(key: U) => (obj: T) => obj[key];

// const addons = getKeyValue<keyof IEnvState, IEnvState>("addons")(state);