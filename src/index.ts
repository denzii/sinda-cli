#!/usr/bin/env node
"use strict";

declare global {
	namespace NodeJS {
	  interface ProcessEnv {
		NODE_ENV: 'development' | 'production';
		PORT?: string;
		PWD: string;
		Render?: RenderContext;
		BackendAddress: string;
		BackendPort: number;
	  }
	  interface EventEmitter{
		  args: ConsoleArg[]
		  argRender: RenderContext
		  AppContext: AppContext
		  ReactContext: React.Context<RenderContext>
		  HostPlatforms: HostPlatform[]
	  }
	}
}

/**@todo convert help to readme.md */
const help =`
Command Line Interface Usage (linux, macOs, windows):
$ sindagal

Valid Options
--Render=value (Defaults to none)
	Usage:
	--render=web
	--render=webserver
	--render=none

Examples
$ sindagal
$ sindagal --render=web  Run and threat this as a browser application
& sindagal --render=webserver  Run and threat this as a serverside rendered application
`;

import ShellResponse  from "./model/shellResponse";

import * as dotenv from "dotenv";
import App from './view/app.js';
import React from 'react';
import ConsoleArg from './model/interface/consoleArgs';
import CommandLineApp from './model/cli.js';
import { AppContext } from './model/appContext.js';
import { RenderContext } from './model/renderContext.js';
import cluster from "cluster";
import Env, { HostPlatform } from "./model/env.js";
import Shell from "./model/shell.js";
import { IEnvState } from "./model/state.js";
import chalk from "chalk";

dotenv.config();
const {hostConfigPath, stateCommand, hostPlatforms} = Env.Meta();
process.HostPlatforms = hostPlatforms;

/**@TODO refactor survey logic to display questions only for the given platform */
if (!hostPlatforms.includes(HostPlatform.Windows)) throw new Error("This is Windows only for now.");

// const execResponses: ShellResponse[] = Shell.Run([stateCommand]);
// const envMetaResponse = execResponses[0];
// if(!envMetaResponse.std.stdout){
// const envState = JSON.parse(String(envMetaResponse.std.stdout)) as IEnvState;

const UserInterface: (props: {context: CommandLineApp}) => JSX.Element = App

const cli = new CommandLineApp();
const ui: JSX.Element = UserInterface({context: cli});



if (cluster.isPrimary){
	CommandLineApp.RenderUI(ui, cli);
}

