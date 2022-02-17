import React, { Context, createContext, useEffect, useLayoutEffect, useState } from 'react';
import { Responsive, withLayout } from '../model/view/layout.js';
import Style from '../style/index.js';
import { merge } from '../model/util.js';
import InkDivStyles from '../type/inkDivStyles.js';
import InkTextStyles from '../type/InkTextStyles.js';
import Sinda, { Styles } from '../model/view/sinda.js';
import {RenderContext} from '../model/renderContext.js';
import Hook, { CommsProtocol, WorkerStatus, useServer } from '../model/hook/index.js';
import Comms from '../model/comms.js';
import CLI from '../model/cli.js';
import {Box, Spacer, Static, Text, useInput, useStdout} from "ink"
// import * as StdOutFixture from "fixture-stdout";
// import { withStdout } from '../model/view/stdout.js';
import figlet from "figlet";
/** @ts-ignore */
import patchConsole from "patch-console";
import Index from './index.js';
import Survey from './survey.js';
import RouteContext from '../model/routeContext.js';
import { Element } from './checkboxSet.js';
import e from 'express';
import { Route, Router, Routes } from 'react-router-dom';
import chalk from 'chalk';
import { exit } from 'process';
import Gradient from 'ink-gradient';
import Details from './details.js';

export enum IPCMessage {Boot, Stdout, Execution} 
export const RouterContext = React.createContext<{
	router: React.Dispatch<React.SetStateAction<RouteContext>>;
	setSurveyResults:(results: Element[]) => void;
   } | undefined>(undefined);
	
const App: (props: { context: CLI}) => JSX.Element = (props) => { 
	const [activePage, setRoute] = useState(RouteContext.Index);
	const [stds, writeStd] = useState<string[]>([]);
	const [isOnline, toggleWorkerStatus] = useState<WorkerStatus>(WorkerStatus.Offline);
	useEffect(() => {
		patchConsole((stream:string, data:string) => {
			writeStd((stds: string[]) => [...stds, data]);
		});
		
		props.context.worker!.on('message', (message: {type: IPCMessage, payload: string}) => {
			switch (message.type) {
				case IPCMessage.Boot:
					toggleWorkerStatus(WorkerStatus.Online);
					break;
				case IPCMessage.Stdout:
					writeStd((stds: string[]) => [...stds, message.payload]);
					break;
				}
		});
		return () => {props.context.worker!.off('message', () => {})};
	},[]);
			
	const GlobalContextProvider: React.Provider<RenderContext> = process.ReactContext.Provider;
	const [surveyResults, setSurveyResults] = useState<Element[]>([]);
	const handleSurveyResults = (results: Element[]) => {
		setSurveyResults(results);
	}
	
	const Div = Sinda.Div;
	const P = Sinda.P;

	return <>
        <Static items={stds}>{std =><Div key={std} style={{flexDirection:"column", justifyContent:"flex-start"}}><P >{std.trim()}</P></Div>}</Static>
		
		<GlobalContextProvider value={props.context.context}>
			<RouterContext.Provider value={{router:setRoute, setSurveyResults: handleSurveyResults}}>
				{activePage === RouteContext.Index  &&<Index/>}
				{/* {activePage === RouteContext.Options && <Options/>} */}
				{activePage === RouteContext.Survey  &&<Survey/>}
				{activePage === RouteContext.Results  && surveyResults &&<Details worker={props.context.worker!} writeStd={writeStd} results={surveyResults}/>}
			</RouterContext.Provider>
		</GlobalContextProvider>
		
	</>
}

export default withLayout(App);

/* <s.div style={merge([textBlock, text])}>
	<s.p>{isOnline}</s.p>
</s.div> */

/* <s.div style={merge([textBlockStyles, textStyles])} context={context}>
	<s.p style={{}}>How would you like to make use of this app?</s.p>
</s.div> */
			// <s.div style={merge([textBlockStyles, textStyles])} context={context}>
			// 	<s.p style={{}}>Let's get to know you a little bit for the best experience!</s.p>
			// </s.div>
		/* <s.div style={merge([textBlockStyles, textStyles])} context={context}>
				<s.p style={{}}>Please check one or more. </s.p>
				<s.p style={{}}>Install / Manage terminal emulators & extensions on this machine</s.p>
				<s.p style={{}}>Install / Manage shells on this machine</s.p>
				<s.p style={{}}>Install / Manage Containerization Software on this machine</s.p>
				<s.p style={{}}>Install the SindaScript Developer Tools on this machine</s.p>
				<s.p style={{}}>Checkout a SindaCode Template to Github</s.p>
				<s.p style={{}}>Manage your in App Preferences</s.p>
		</s.div> */