import { RenderContext } from "../renderContext";

export enum ConsoleFlag {
    Render = "render"
}

type ConsoleArg =  {key:ConsoleFlag, value: string};


export default ConsoleArg;