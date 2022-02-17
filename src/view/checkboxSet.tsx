import { useFocus, useFocusManager, useInput } from "ink";
import React, { useContext, useEffect, useRef, useState } from "react";
import { GradientTheme } from '../type/gradientTheme.js';
import Sinda, { Props, Styles } from '../model/view/sinda.js';
import { merge } from "../model/util.js";
import { Question, SurveyContext } from "./survey.js";
import Visual from "./visual.js";
import { HostPlatform } from "../model/env.js";

export type CheckboxSet = {
	mutuallyExclusive: boolean, 
	elements: Element[],
    checkboxGlyph: Element,	
}
export type Colourization = GradientTheme
export interface Element {
    context?: {
        name?: Question,
        owner:Question| undefined
        isButton: boolean,
        
        cmdKey?: string, 
        heading?: Element,
        annotation?: Element,
        mutuallyExclusive?: boolean,
        availability?: HostPlatform[],
        arguments?: {key: string, value: string}[],
    }
	text: string,
	secondaryText?: string,
	colourization?: Colourization,
	secondaryColourization?: string | GradientTheme,
}

const CheckboxSet: (props: {
        questionGroupIds: {name:Question, context: { heading: Element, annotation: Element, mutuallyExclusive?: boolean }}[], 
        activeGroupId: Question, 
        elements:Element[], 
        checkboxGlyph: Element, 
    }) => JSX.Element = (props) => {
    const mountedRef = useRef(true);
    const ctx = useContext(SurveyContext);

    useEffect(()=>{
        return () => { mountedRef.current=false; }
    })
    
    return <>
        {props.elements.map((element: Element, index) => {
            const Div = Sinda.Div;
            const P = Sinda.P;
            
            const {isFocused, focus} = useFocus({id: String(index)});
            const [checkedBoxIds, setCheckedBoxIds] = useState<number[]>([]);
            const {disableFocus, enableFocus, focusNext, focusPrevious} = useFocusManager();
            
            const [buttonText, setButtonText] = useState(element.text);
            const isChecked = checkedBoxIds.includes(index);
            const groupContext = props.questionGroupIds.find(id => id.name == element.context?.name);
            
            useEffect(() => {
                focus("0");
            return () => { 
                disableFocus();
            };
        },[]);

        useInput((input, key) => {
            if (isFocused){
                if (element.context?.isButton){
                    if (key.return){
                        if (buttonText == element.text) {
                            setButtonText(buttonText => element.secondaryText!);
                            disableFocus();
                        }
                        else{
                            // if (mountedRef.current){
                                ctx!.finalizeSet(checkedBoxIds);
                            // }
                        };
                        //props.finalizeSet(checkedBoxIds);
                    } 
                }
                if(key.escape){
                    if (buttonText === element.secondaryText){
                        enableFocus();
                        focus("0");
                        setButtonText(buttonText => element.text);
                    }
                }
                if(key.return){
                    // if element is focused and enter key is hit, remove it from active elems array else add it in
                    isChecked 
                    ? setCheckedBoxIds(ids => ids.filter(id => index != id)) 
                    : setCheckedBoxIds(ids => [...ids, index]);
                }
                if(key.downArrow && buttonText !== element.secondaryText){
                    if (props.elements[index+1] != undefined && props.elements[index+1].context?.name != element.context?.name){
                        ctx!.pageModifier(props.elements[index+1].context?.name!);
                        const nextPageContext = props.questionGroupIds.find(id => id.name == props.elements[index+1].context?.name!); 
                        if (nextPageContext){
                            if (nextPageContext.context.heading && nextPageContext.context.heading.text){
                                ctx!.pageItemModifier(String(nextPageContext.context.heading.text), nextPageContext.context.heading.colourization as GradientTheme, String(nextPageContext.context.annotation?.text!), nextPageContext.context.annotation?.colourization as GradientTheme);
                            }
                        }
                    } else if(index+1 === props.elements.length){
                        ctx!.pageModifier(props.elements[0].context?.name!);
                        const nextPageContext = props.questionGroupIds.find(id => id.name == props.elements[0].context?.name!); 
                        if (nextPageContext){
                            if (nextPageContext.context.heading && nextPageContext.context.heading.text){
                                ctx!.pageItemModifier(String(nextPageContext.context.heading.text), nextPageContext.context.heading.colourization as GradientTheme, String(nextPageContext.context.annotation?.text!), nextPageContext.context.annotation?.colourization as GradientTheme);
                            }
                        }
                    }
                    ctx!.arrowKeyDown();
                    focusNext();
                }
                if(key.upArrow && buttonText !== element.secondaryText){
                    if (props.elements[index-1] != undefined && props.elements[index-1].context?.name != element.context?.name){
                        ctx!.pageModifier(props.elements[index-1].context?.name!);
                        const nextPageContext = props.questionGroupIds.find(id => id.name == props.elements[index-1].context?.name!); 
                        if (nextPageContext){
                            if (nextPageContext.context.heading && nextPageContext.context.heading.text){
                                ctx!.pageItemModifier(String(nextPageContext.context.heading.text), nextPageContext.context.heading.colourization as GradientTheme, String(nextPageContext.context.annotation?.text!), nextPageContext.context.annotation?.colourization as GradientTheme);
                            }
                        }
                    } else if(index-1 == -1){
                        ctx!.pageModifier(props.elements[props.elements.length-1].context?.name!);
                        const nextPageContext = props.questionGroupIds.find(id => id.name ==props.elements[props.elements.length-1].context?.name!); 
                        if (nextPageContext){
                            if (nextPageContext.context.heading && nextPageContext.context.heading.text){
                                ctx!.pageItemModifier(String(nextPageContext.context.heading.text), nextPageContext.context.heading.colourization as GradientTheme, String(nextPageContext.context.annotation?.text!), nextPageContext.context.annotation?.colourization as GradientTheme);
                            }
                        }
                    }
                    ctx!.arrowKeyUp();
                    focusPrevious();
                }
            }
        });
           
        const Component = element.context?.isButton 
            ? () => {
                const buttonBorderColour: string = isFocused ? "rgb(255, 215, 95)": "";
                const buttonDimensions = buttonText == element.secondaryText? {width: element.secondaryText.length + 2, height:3} :  {width: element.text.length + 2, height:3};
                return <>
                <Div style={{flexDirection:"row", justifyContent:"center", height:1,}}> 
                    <Div style={merge([buttonDimensions, {borderColor:buttonBorderColour, borderStyle:"round"}])}>
                        <Visual isFocused={isFocused} focusColour={element.secondaryColourization as GradientTheme}>{buttonText}</Visual>
                    </Div>
                </Div>
            </>
        }
            : () => {
            const glyph: string | undefined = isChecked
            ? props.checkboxGlyph.text 
            : props.checkboxGlyph.secondaryText;
            const glyphColour: string = "rgb(255, 215, 95)";
            return <>
                <Div style={{paddingTop: 0.5, paddingBottom:0.5, justifyContent:"flex-start"}}>
                    {glyph && <P style={{color:glyphColour}}>{glyph} </P>}
                    <Visual isFocused={isFocused} focusColour={element.secondaryColourization as GradientTheme}>{element.text}</Visual>
                </Div>
            </>
        }
            
        return (groupContext?.name === props.activeGroupId || groupContext?.name == Question.None) && <Component key={index}/>
    })}
        
</>
}
    
export default CheckboxSet;