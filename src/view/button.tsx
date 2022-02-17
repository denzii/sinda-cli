import React from "react";
import { merge } from "../model/util.js";
import Sinda from "../model/view/sinda.js";
import { GradientTheme } from "../type/gradientTheme.js";
import { Element } from "./checkboxSet.js";
import Visual from "./visual.js";

const Button = (props: {element: Element, isFocused: boolean, isConfirmationOpen: boolean}) => {
        const Div = Sinda.Div;
        
        const buttonBorderColour: string = props.isFocused ? "rgb(255, 215, 95)": "";
        const buttonDimensions = props.isConfirmationOpen ? {width: props.element.secondaryText!.length + 2, height:3} :  {width: props.element.text.length + 2, height:3};
        return <>
        <Div style={{flexDirection:"row", justifyContent:"center", height:1,}}> 
            <Div style={merge([buttonDimensions, {borderColor:buttonBorderColour, borderStyle:"round"}])}>
                <Visual isFocused={props.isFocused} focusColour={props.element.secondaryColourization as GradientTheme}>{props.isConfirmationOpen ? props.element.secondaryText! : props.element.text}</Visual>
            </Div>
        </Div>
    </>
}

export default Button;