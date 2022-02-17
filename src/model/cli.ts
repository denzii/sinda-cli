import chalk from "chalk";
import cluster, { Cluster, Worker } from "cluster";
import { IncomingMessage, ServerResponse, createServer } from "http";
import  {Instance as InkRenderer, render as inkRender}  from 'ink';
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom";
import { ValidationResult } from "../type/cliFlags.js";
import { ValidationRule } from "../type/cliFlags.js";
import { RenderContext as RenderContext } from "./renderContext.js";
import { ArgCriterion } from "./consoleArgRules.js";
import ConsoleArg, { ConsoleFlag } from "./interface/consoleArgs.js";
import React, {Context} from "react";
import { AppContext } from "./appContext.js";
import express from "express";
import App, { IPCMessage } from '../view/app.js';
import http from "http";
import { WorkerStatus } from "./hook";
import * as fs from "node:fs";
/**@ts-ignore */
import patchConsole from 'patch-console';
import * as events from'events';
export default class CLI {
    public flags: ConsoleArg[];
    public context: RenderContext;
	public worker?: Worker;
	public process: NodeJS.Process;

    constructor() {
        this.flags= CLI.processFlags();
        this.context = CLI.processContext(this.flags);
		this.worker = CLI.configureWorker();
		this.process= process;
    }

	public static RenderUI: (jsx: JSX.Element, context: CLI) => InkRenderer | Element | void = (jsx, context) => {
        /**@TODO */
		// RenderContext.None      = ssr & dom on terminal 
        // RenderContext.Web       = csr & server out on terminal
        // RenderContext.Webserver = ssr & server out on terminal

        if (context.context === RenderContext.None || context == undefined) return inkRender(jsx, {patchConsole:true});
		if (context.context === RenderContext.Web) return ReactDOM.render(jsx, document.getElementById("root"));
		
        return ReactDOM.hydrate(jsx, document.getElementById("root"));
	};

    private static processFlags: () => ConsoleArg[] = () => {
		const toKey: (arg: string) => string = (arg) => (arg.substring(0, arg.indexOf("=")).substring(2));
		const toValue: (arg: string) => string = (arg) => arg.substring(arg.lastIndexOf("=") + 1);
		const withGlobalHandle: (args: ConsoleArg[]) => ConsoleArg[] = (args) => process.args = args; 
		const withValidation: (args: ConsoleArg[], rules?: ValidationRule[]) => ConsoleArg[] = (args, rules) => {

			//define validation rules on a per cli flag basis, put them in an array for processing
			// keys have to match the cli flag names.
			const defaultRules = [{ key: "render", value:[ArgCriterion.None], oneOfType: RenderContext}];
			const activeRules: ValidationRule[] = rules ?? defaultRules;
			
			const validationResults: ValidationResult[] = activeRules.map(rule => {
				const targetArg: ConsoleArg | undefined = args.find(arg => arg.key == rule.key);
			

				// check if current cli flag indeed must be validated against the "mandatory" rule
				const itIsRequired: () => boolean =() => rule?.value.includes(ArgCriterion.Required);
				// define the criteria for passing this validation
				const requiredCriteria: boolean = !(undefined == targetArg || undefined == targetArg?.value || undefined == targetArg?.key)
				// define the message to be displayed if this validation fails
				const itIsRequiredMessage = ` Please supply a value for the mandatory flag: "${rule.key}"`;
				
				// check if current cli flag can pass validation, no questions asked
                const itIsImplicitlyValid: () => boolean = () => undefined != targetArg && rule.value.includes(ArgCriterion.None);
				// define the criteria for passing this validation
				const validCriteria: boolean = true;	
				
				
                const itHasToBeCapitalized: () => boolean = () => undefined != targetArg && rule.value.includes(ArgCriterion.Capitalized);
				const itHasToBeCapitalizedCriteria: boolean = undefined != targetArg && (/[A-Z]/.test(targetArg.value.charAt(0)));
				const capitalizeCriteria = ` Please capitalize the value of: "${rule.key}"`;
				
                const itHasToMatchKeys: () => boolean = () => undefined != targetArg && rule.value.includes(ArgCriterion.Exact);
				const matchCriteria: boolean = Object.values(rule.oneOfType).includes(targetArg?.value);
				const itHasToMatchKeysMessage = ` Please provide one of the values documented for the flag: "${rule.key}". Values are case sensitive!`;
				
				let results: ValidationResult[] = [];
				if (itIsRequired()) results.push({ success: requiredCriteria, message: itIsRequiredMessage });
				if (itIsImplicitlyValid()) results.push({ success: validCriteria, message:undefined });	 
				if (itHasToBeCapitalized()) results.push({ success: itHasToBeCapitalizedCriteria, message:capitalizeCriteria });
				if (itHasToMatchKeys()) results.push({success: matchCriteria, message:itHasToMatchKeysMessage});
				return results;
			}).flat();
			
			const failedRules = validationResults.filter(result => !result?.success);
			if (failedRules.length > 0) {
				console.log(chalk.redBright("* ~Hi!"));
				failedRules.forEach(rule => console.error(chalk.red(`${rule?.message}`)));
				throw new Error(chalk.red("Argument validation failed for the Command-line interface flags."));
			}
	
			return args;
		}
	
		return withGlobalHandle(
				withValidation(process.argv
					.filter(arg => toKey(arg) !== "") // remove all cli arguments without valid keys
					.map(arg => ({key: toKey(arg) as ConsoleFlag, value: toValue(arg)})) // map the string into a key value pair
				)
			) 	
		; 
	};

	private static processContext: (consoleFlags: ConsoleArg[]) => RenderContext = (flags: ConsoleArg[]) => {
		const withGlobalHandle: (ctx: RenderContext) => RenderContext = (ctx) => {
            const reactContext: Context<RenderContext> = React.createContext(ctx);
            process.ReactContext = reactContext;
            process.AppContext = typeof window === 'undefined' ? AppContext.Server : AppContext.Client; 
            
            return process.argRender = ctx;
        }; 
		const cliFlag: RenderContext | undefined = flags.find(flag => flag.key == "render")?.value as RenderContext;
		const envFlag = process.env.Render;
	
		const exceptionMsg = chalk.red(`* ~Hi! \n\rThe value: "${envFlag}" is invalid, Please revisit the .env file and supply a valid one!`)
		if (envFlag != null && !Object.values(RenderContext).includes(envFlag)) throw new Error(exceptionMsg);
        
		return withGlobalHandle(cliFlag ?? envFlag ?? RenderContext.None);
	};

	private static configureWorker = () => {

		if (cluster.isPrimary){
			// allows 50 questions in total, each iteratable element equals to an event listener
			events.EventEmitter.setMaxListeners(55);
			//silence the workers to be forked.
			cluster.setupPrimary({silent:true});

			const worker = cluster.fork();

			// redirect stderr & stdout from worker to primary
			// the purpose of this is to collect all output there & set it into state
			// so the regular old outputs could be written above the interactive CLI space
			// this will prevent the interactive box from being pushed up on the console 
			// so it can always stay at the bottom
			worker.process.stderr!.pipe(process.stderr);
			worker.process.stdout!.pipe(process.stdout);

			return worker;
		} 
		// below this line, process refers to the worker.
		// use this as a means of sending feedback to parent once worker is online
		process.send!({type:IPCMessage.Boot});
		patchConsole((stream:string, data:string) => {
			process.send!({type:IPCMessage.Stdout, payload: data});
		});
		// process.stdin.resume();
		// console.log('Enter the data to be displayed ');
		// process.stdin.on('data', function(data) { process.stdout.write(data) })
		// let stdout :string = "";
		// process.stdout!.on('data', (chunk) => {
		// 	stdout += chunk.toString();
		// });
		// process.stdout!.on("end", () => {
		// 	console.log(chalk.blue(stdout.toString()))
		// 	process.send!({std: stdout});
		// 	stdout = "";
		// })

		// let stderr:string="";
		// process.stdin!.on('data', (chunk) => {
		// 	stderr += chunk.toString();
		// });
		// process.stdin!.on("end", () => {
		// 	// console.log(chalk.red(stderr.toString()))
		// 	process.send!({std: stderr});
		// 	stderr = "";
		// })

		// console.log()
		http.createServer((req, res) => {
			res.writeHead(200);
			//@ts-ignore

			res.end(ReactDOMServer.renderToStaticMarkup(App({context: this})));
		}).listen(8085)
	
			// console.log("hi,", `I'm worker:${currentWorker.pid}`, "I've received a message just now. Its:", message)
		
		// const requestListener = (req: IncomingMessage, res: ServerResponse) => {
		//     res.writeHead(200); 
		//     res.end();
		// }
		// const server = express();
		// server.listen(8080);
		// server.get('/', function (req, res) {
			// res.send(ReactDOMServer.renderToString(ui))
		// }) 
	}


}
