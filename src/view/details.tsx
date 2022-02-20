import { useInput , Text } from "ink";
import { Text as P, useFocus } from "ink";
import Gradient from "ink-gradient";
import React, { Fragment, useContext, useState } from "react";
import Data from "../data/index.js";
import RouteContext from "../model/routeContext.js";
import Sinda from "../model/view/sinda.js";
import { GradientTheme } from "../type/gradientTheme.js";
import Button from "./button.js";
import { Element } from "./checkboxSet.js";
import { SurveyConfig, SurveyContext } from "./survey.js";
import VisualElement from "./visual.js";
import Executable, { Exe, ShellType } from "../model/executable.js";
import Shell from "../model/shell.js";
import chalk from "chalk";
import StandardOut from "../model/standardOut.js";
import { Worker } from "cluster";
import { useEffect } from "react";
import { IPCMessage } from "./app.js";
import Env from "../model/env.js";
/**@ts-ignore */
import patchConsole from "patch-console";
import { capitalize } from "../model/util.js";

enum TaskStatus {
    Queued= "Queued",
    Running= "Running",
    Complete = "Completed",
    Failed = "Failed",
    // Warning= "Warning"
}
const Details = (props:{results:Element[], worker: Worker, writeStd: React.Dispatch<React.SetStateAction<string[]>>}) => {
    const config: SurveyConfig = Data.config();
    const [pageHeading, setPageHeading]= useState<{text: string, gradient: GradientTheme}>({text: "Will execute the procedures with the following keys:", gradient:config.questionGroupIds[0].context.heading.colourization!});
	const [pagePrompt, setPagePrompt] = useState<{text: string, gradient: GradientTheme}>({text: "These features come without warranty!", gradient:config.questionGroupIds[config.questionGroupIds.length -1].context.annotation.colourization!});
	const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [tasksState, setTasksState] = useState<{taskKey: string, taskStatus:TaskStatus, taskStd?:StandardOut, timestamp?:string, arguments?:{key: string, value: string}[]}[]|undefined>(undefined);

    useEffect(()=> {
        const initialState = props.results
            .filter(elem => elem.context?.cmdKey != undefined)
            .map(elem => ({taskKey:elem.context?.cmdKey!, taskStatus: TaskStatus.Queued, arguments: elem.context?.arguments}));
        setTasksState(ts => initialState);
		return () => {};
    },[]);

	// useEffect(()=>{
	// 	const runCommand = async() => {
	// 		const asyncRes = await Promise.all(tasksState!.map(async (task) => {
	// 			const formattedArgs = task.arguments?.map((arg) => `-${capitalize(arg.key)} ${arg.value}`);
	// 			const exeArgs = formattedArgs ? [Env.PSFuncPath(), task.taskKey, formattedArgs.join(" ")] : [Env.PSFuncPath(), task.taskKey];

	// 			// return new Executable(ShellType.Powershell, task.taskKey,[]);
	// 			// await Shell.RunAsync([new Executable(ShellType.Powershell, ".", exeArgs)]);
	// 			return task;
	// 		}));
	// 		tasksState
	// 	}
	// },[isConfirmed]);

    const onConfirm = () => {
        setConfirmationOpen(false);
        setIsConfirmed(true);
        setPageHeading({text: "Executed the following commands...", gradient:config.questionGroupIds[0].context.heading.colourization!});
        setPagePrompt({text: "Exceptions will be visible above the CLI Box", gradient:config.questionGroupIds[config.questionGroupIds.length -1].context.annotation.colourization!});

        const exes: Exe[] = tasksState!.map(task => {
            const formattedArgs = task.arguments?.map((arg) => `-${capitalize(arg.key)} ${arg.value}`);
            const exeArgs = formattedArgs ? [Env.PSFuncPath(), task.taskKey, formattedArgs.join(" ")] : [Env.PSFuncPath(), task.taskKey];

            // return new Executable(ShellType.Powershell, task.taskKey,[]);
            return new Executable(ShellType.Powershell, ".", exeArgs);
        });
            // const response: ShellResponse = Shell.RunSync([new Executable(ShellType.Powershell, "Test-Elevation", [])])[0];

        const newState = exes.map(exe => ({taskKey:exe.arguments[1], taskStatus: TaskStatus.Running}));
        setTasksState(ts => newState);


        const tasks = exes.map(exe =>{
			// TODO: Show Progress bar instead of the Running status, not included in MVP
			//	Push realtime results from std inside the box state
			// TODO: Concurrent execution with "DependsOn" flags
			// TODO: Move to async useEffect function
            const result = Shell.RunSync([exe])[0];
            const hasError = undefined != result.std.stderr;

            // written above the box as its caught by terminal patcher
            const outHeading=chalk.green("STD Out");
            const errHeading=chalk.red("STD Error");
            const out: string= result.std.stdout ? outHeading + " for " + exe.arguments[1] + ": " + result.std.stdout + " ": "";
            const err: string= result.std.stderr ? errHeading + " for " + exe.arguments[1] + ": " + result.std.stderr + " ": "";
            props.writeStd((stds: string[]) => [...stds,out, "}", "\n"]);
            props.writeStd((stds: string[]) => [...stds,err]);

            const status = hasError ? TaskStatus.Failed : TaskStatus.Complete;

            return {taskKey: exe.arguments[1], taskStatus: status, taskStd:result.std, timestamp:result.executedAt}
        });
        setTasksState(ts => tasks);
    }

    useInput((input, key) =>{
        if(key.return){
            if (!isConfirmed){
                if(confirmationOpen){
                    onConfirm();
                }else {
                    setConfirmationOpen(true);
                }
            }
            if (key.escape && confirmationOpen){
                setConfirmationOpen(false);
            }
        }
    });

    const Div = Sinda.Div;
    const P = Sinda.P;

    const ConfirmButton = () => <Div key={props.results.length} style={{alignSelf:"center", display:isConfirmed ? "none" : "flex" }}>
                                    <Button element={config.button} isConfirmationOpen={confirmationOpen} isFocused={true}></Button>
                                </Div>

    return  <Div style={{flexDirection:"column", width:"95%", justifyContent:"space-between", minWidth:"10%"}}>
                <Div style={{flexDirection:"row", justifyContent:"flex-start"}}>
                    <Div style={{marginLeft:-2, marginTop:0, height:1}}>
                        <VisualElement gradient={String(config.logo.options.colourization) as GradientTheme} figletOptions={config.logo.options.glyph}>
                            {config.logo.text}
                        </VisualElement>
                    </Div>
                    <Div style={{flexDirection:"column", marginLeft:-2, marginTop:1, height:8}}>
                        <VisualElement gradient="summer">
                            Consent
                        </VisualElement>

                    </Div>
                </Div>
                <Div style={{height:"100%",  flexDirection:"row", justifyContent:"center"}}>
                    <Div style={{height:"100%", flexDirection:"column", justifyContent:"flex-start", marginTop:0}}>
                        <Div style={{flexDirection:"row", justifyContent:"center", height:3}}>
                            <VisualElement gradient={pageHeading.gradient}>
                                {pageHeading.text}
                            </VisualElement>
                        </Div>
                        {tasksState && tasksState.map((elem, index) => {
                                const taskStatusColour = (elem?.taskStatus == TaskStatus.Failed) ? "red": "green";
                                const execReport = elem?.timestamp ? `Executed at: ${elem.timestamp}` : "";
                                const taskStatus = isConfirmed ? elem?.taskStatus : "";

                                return  <Div key={index} style={{}}>
                                            <Gradient key={index} name="teen"> {index+1}) </Gradient>
                                            {isConfirmed && <>
                                                <P style={{color:taskStatusColour}}>[</P>
                                                <P style={{dimColor:true}}>{taskStatus}</P>
                                                <P style={{color:taskStatusColour}}>] </P>
                                            </>}
                                            <P>{elem.taskKey} {execReport} </P>
                                            {isConfirmed && <P>{elem?.taskStd?.stderr?.split("\n")[0].split(".")[0]}</P>}
                                        </Div>
                        })}
                        <ConfirmButton/>
                    </Div>
                </Div>
                <VisualElement gradient={pagePrompt.gradient}>
                    {pagePrompt.text}
                </VisualElement>
                <Div style={{alignSelf:"center"}}>
                    <VisualElement gradient={String(config.footer.colourization) as GradientTheme}>
                        {config.footer.text}
                    </VisualElement>
                </Div>
            </Div>
}

export default Details;
