import figlet from "figlet";
import Gradient from "ink-gradient";
import React from "react";
import Sinda from "../model/view/sinda.js";
import { GradientTheme } from "../type/gradientTheme";
import { Colourization } from "./checkboxSet.js";

const VisualElement = (props: {children: string, backgroundColour?: string, colour?: string, gradient?: Colourization, figletOptions?: figlet.Options, isFocused?: boolean, focusColour?: Colourization}) => { 
    const P = Sinda.P;
    
    const elementText = props.figletOptions ? figlet.textSync(props.children, props.figletOptions) : props.children;

    if (props.isFocused){
    return <>
            <Gradient name={props.focusColour as GradientTheme}>
                <P style={{backgroundColor: props.backgroundColour, color:props.colour}}>{elementText}</P>
            </Gradient>
        </>
    }

    return <>
    {props.gradient && 
        <Gradient name={props.gradient as GradientTheme}>
            <P>{elementText}</P>
        </Gradient>
    }
    {!props.gradient && 
        <P>{elementText}</P>
    }
    </>
}

export default VisualElement