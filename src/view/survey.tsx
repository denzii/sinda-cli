import React, { Context, createContext, Dispatch, Fragment, SetStateAction, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Responsive, withLayout } from '../model/view/layout.js';
import Style from '../style/index.js';
import { merge } from '../model/util.js';
import InkDivStyles from '../type/inkDivStyles.js';
import InkTextStyles from '../type/InkTextStyles.js';
import Sinda, { Props, Styles } from '../model/view/sinda.js';
import {RenderContext} from '../model/renderContext.js';
import Hook, { CommsProtocol, WorkerStatus, useServer } from '../model/hook/index.js';
import Comms from '../model/comms.js';
import CLI from '../model/cli.js';
import {Box, Key, Spacer, Static, Text, useFocus, useFocusManager, useInput, useStdout} from "ink"
import figlet from "figlet";
import { AppContext } from '../model/appContext.js';
import Gradient from 'ink-gradient';
// import Item, { ConfirmProps } from './item.js';
import { stringify } from 'querystring';
import RouteContext from '../model/routeContext.js';
import e from 'express';
import CheckboxSet, { Colourization, Element } from './checkboxSet.js';
import { GradientTheme } from '../type/gradientTheme.js';
import VisualElement from './visual.js';
import Button from './button.js';
import Visual from "./visual.js";
import BigText from "ink-big-text";
import { useContext } from 'react';
import { RouterContext } from './app.js';
import Checkbox from './checkbox.js';
import { ShellType } from '../model/executable.js';
import { HostPlatform } from '../model/env.js';
import Data from '../data/index.js';
// import { useNavigate } from "react-router-dom";

export type SurveyElement = {
	name: Question,
	heading: Element,
	annotation: Element,
	mutuallyExclusive: boolean,
	contents: Element[],
};

export enum Question {
	None="Confirm",
	Terminal="Terminal",
	Shell="Shell",
	Virtual="Virtual",
	SDK="SDK",
	Boilerplate="Boilerplate"
}

export interface SurveyConfig {
	pageToggle: Question,
	checkboxGlyph: Element,	
	button: Element,
	questions: Element[],
	footer: Element,
	questionGroupIds: {
		name: Question, 
		context: {
			heading: Element;
			annotation: Element;
			mutuallyExclusive?: boolean;
		}
	}[],
	logo: {
		text: string,
		options: {
			glyph: figlet.Options,
			colourization?: Colourization
		},
	},
}

export const SurveyContext = React.createContext<{
	 pageModifier: React.Dispatch<React.SetStateAction<Question>>;
	 pageItemModifier: (pageHeading: string, headingGradient: GradientTheme, pagePrompt: string, promptGradient: GradientTheme) => void;
	 arrowKeyUp: () => void; 
	 arrowKeyDown: () => void; 
	 finalizeSet: (results: number[]) => void; 
	} | undefined>(undefined);
	 
const Survey = () => {
	let mountedRef = useRef(true)
	const ctx = useContext(RouterContext);
    const config: SurveyConfig = Data.config();

	const Div = Sinda.Div;
	const P = Sinda.P;
	
	const firstVisibleElementGroupId = config.questionGroupIds.find(id => id.name == config.questions[0].context?.name!);

	const firstVisibleCheckboxPageHeading = firstVisibleElementGroupId?.context?.heading?.text!;
	const firstVisibleCheckboxHeadingGradient = firstVisibleElementGroupId?.context.heading.colourization!;
	
	const [pageHeading, setPageHeading]= useState<{text: string, gradient: GradientTheme}>({text: firstVisibleCheckboxPageHeading, gradient:firstVisibleCheckboxHeadingGradient});
	const [pagePrompt, setPagePrompt] = useState<{text: string, gradient: GradientTheme}>();
	const [isUpArrowPressed, setUpArrowState] = useState<boolean>(false);
	const [isDownArrowPressed, setDownArrowState] = useState<boolean>(false);
	const [activePage, setActivePage] = useState<Question>(config.questions[0].context?.name!);
	const [surveyResult, setSurveyResult] = useState<Element[]>([]);
	const [checkedBoxIds, setCheckedBoxIds] = useState<number[]>([]);
	const {disableFocus, enableFocus, focusNext, focusPrevious} = useFocusManager();
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const inkFocus = useFocus({id:"0"});
 
	useEffect(()=>{
		inkFocus.focus("0");
		return () => {mountedRef.current = false; disableFocus();}
	},[]);

	const finalizeSurvey = (results: number[]) => {
		const selectedFeatures = config.questions
		.filter((question, index) => results.includes(index))// get the question objects which match the selected ids.
		setSurveyResult(selectedFeatures);
		ctx!.setSurveyResults(selectedFeatures);
		ctx!.router(RouteContext.Results);
	}

	const handlePageItems = (pageHeading: string, headingGradient: GradientTheme, pagePrompt:string, promptGradient: GradientTheme) => {
		setPageHeading({text: pageHeading, gradient: headingGradient});
		setPagePrompt({text:pagePrompt, gradient: promptGradient})
	}
	const animateUpArrowKeyPress = ()=>{
		setUpArrowState(isUpArrowPressed => true)
		setTimeout(() => { setUpArrowState(isUpArrowPressed => false) }, 150);
	}
	const animateDownArrowKeyPress = ()=>{
		setDownArrowState(isDownArrowPressed => true)
		setTimeout(() => { setDownArrowState(isDownArrowPressed => false) }, 150);
	}

	const handleInput = (isElementFocused: boolean, focus: (id: string) => void, isElementChecked: boolean, element: Element, index: number, pressedKey: Key) => {
		if (isElementFocused){
			if (element.context?.isButton){
				if (pressedKey.return){
					if (!confirmationOpen) {
						setConfirmationOpen(buttonText => !confirmationOpen);
						disableFocus();
					}
					else{
						finalizeSurvey(checkedBoxIds);
					};
				} 
			}
			if(pressedKey.escape){
				if (confirmationOpen){
					enableFocus();
					focus("0");
					setConfirmationOpen(!confirmationOpen);
				}
			}
			if(pressedKey.return){
				// if element is focused and enter key is hit, remove it from active elems array else add it in
				isElementChecked 
				? setCheckedBoxIds(ids => ids.filter(id => index != id)) 
				: setCheckedBoxIds(ids => [...ids, index]);
			}
			
			if(pressedKey.downArrow && !confirmationOpen){
				if (config.questions[index+1] != undefined && config.questions[index+1].context?.name != element.context?.name){
					setActivePage(config.questions[index+1].context?.name!);
					const nextPageContext = config.questionGroupIds.find(id => id.name == config.questions[index+1].context?.name!); 
					if (nextPageContext){
						if (nextPageContext.context.heading && nextPageContext.context.heading.text){
							handlePageItems(String(nextPageContext.context.heading.text), nextPageContext.context.heading.colourization as GradientTheme, String(nextPageContext.context.annotation?.text!), nextPageContext.context.annotation?.colourization as GradientTheme);
						}
					}
				} else if(index+1 === config.questions.length){
					setActivePage(config.questions[0].context?.name!);
					focus(String(0));
					const nextPageContext = config.questionGroupIds.find(id => id.name == config.questions[0].context?.name!); 
					if (nextPageContext){
						if (nextPageContext.context.heading && nextPageContext.context.heading.text){
							handlePageItems(String(nextPageContext.context.heading.text), nextPageContext.context.heading.colourization as GradientTheme, String(nextPageContext.context.annotation?.text!), nextPageContext.context.annotation?.colourization as GradientTheme);
						}
					}
				}
				animateDownArrowKeyPress();
				focus(String(index+1));
			}
			if(pressedKey.upArrow && !confirmationOpen){
				if (config.questions[index-1] != undefined && config.questions[index-1].context?.name != element.context?.name){
					setActivePage(config.questions[index-1].context?.name!);
					const nextPageContext = config.questionGroupIds.find(id => id.name == config.questions[index-1].context?.name!); 
					if (nextPageContext){
						if (nextPageContext.context.heading && nextPageContext.context.heading.text){
							handlePageItems(String(nextPageContext.context.heading.text), nextPageContext.context.heading.colourization as GradientTheme, String(nextPageContext.context.annotation?.text!), nextPageContext.context.annotation?.colourization as GradientTheme);
						}
					}
				} else if(index-1 == -1){
					setActivePage(config.questions[config.questions.length-1].context?.name!);
					const nextPageContext = config.questionGroupIds.find(id => id.name ==config.questions[config.questions.length-1].context?.name!); 
					if (nextPageContext){
						if (nextPageContext.context.heading && nextPageContext.context.heading.text){
							handlePageItems(String(nextPageContext.context.heading.text), nextPageContext.context.heading.colourization as GradientTheme, String(nextPageContext.context.annotation?.text!), nextPageContext.context.annotation?.colourization as GradientTheme);
						}
					}
				}
				animateUpArrowKeyPress();
				focusPrevious();
			}
		}
	}

	
	const checkboxes : (false | JSX.Element)[]= config.questions.map((element: Element, index) => {

		const inkFocus = useFocus({id: String(index)});
		const isChecked = checkedBoxIds.includes(index);
		useInput((input, key) => handleInput(inkFocus.isFocused, inkFocus.focus, isChecked, element, index, key));	
		
		const groupContext = config.questionGroupIds.find(id => id.name == element.context?.name);
		const ButtonOrCheckbox: JSX.Element = element.context?.isButton 
			? <Button  key={index} element={element} isConfirmationOpen={confirmationOpen} isFocused={inkFocus.isFocused}></Button>
			: <Checkbox  key={index} element={element} glyph={config.checkboxGlyph} isElementChecked={isChecked} isFocused={inkFocus.isFocused}></Checkbox>		

		//render only if element name matches active page
		const shouldBeRendered: boolean = (groupContext?.name === activePage || groupContext?.name == Question.None);
		return shouldBeRendered && ButtonOrCheckbox
	})
	
	return <>
		<Div style={{flexDirection:"column", width:"95%", justifyContent:"space-between", minWidth:"10%"}}>
			<Div style={{flexDirection:"row", justifyContent:"flex-start"}}>
				<Div style={{marginLeft:-2, marginTop:0, height:1}}>
					<VisualElement gradient={String(config.logo.options.colourization) as GradientTheme} figletOptions={config.logo.options.glyph}>
						{config.logo.text}
					</VisualElement>
				</Div>
				<Div style={{flexDirection:"column", marginLeft:-2, marginTop:0, height:8}}>
					{config.questionGroupIds.map((page) =>{
						const shouldBeRendered: boolean = page.name !== Question.None && undefined != config.questions.find( q => q.context?.name == page.name);
						return shouldBeRendered && <VisualElement key={page.name} gradient={String(page.name == activePage ? "summer" : config.logo.options.colourization) as GradientTheme}>
							{page.name.toString()}
						</VisualElement>
					})}
				</Div>
			</Div>
			<Div style={{height:"100%",  flexDirection:"row", justifyContent:"center"}}>
				<Div style={{height:"100%", flexDirection:"column", justifyContent:"flex-start", marginTop:0}}>
					<Div style={{flexDirection:"row", justifyContent:"center", height:3}}> 
						{pageHeading && <VisualElement gradient={pageHeading.gradient}>
								{pageHeading.text}
						</VisualElement>}
					</Div>
					{checkboxes}
				</Div>
				<Div style={{flexDirection:"column", marginLeft:4, marginTop:5, height:5}}>
					<Text color={isUpArrowPressed?'rgb(255,204,51)':""}>▲</Text>
					<Text color={isDownArrowPressed?'rgb(255,204,51)':""}>▼</Text>
				</Div>
			</Div>
			{pagePrompt && <VisualElement gradient={pagePrompt.gradient}>
				{pagePrompt.text}
			</VisualElement>}
			<Div style={{alignSelf:"center"}}>
				<VisualElement gradient={String(config.footer.colourization) as GradientTheme}>
					{config.footer.text}
				</VisualElement>
			</Div>
		</Div>	
	</>;
}

export default Survey;