import React from "react";
import { merge } from "../model/util.js";
import Sinda from "../model/view/sinda.js";
import { GradientTheme } from "../type/gradientTheme.js";
import { Element } from "./checkboxSet.js";
import Visual from "./visual.js";

const Checkbox = (props: {element: Element, isFocused: boolean, isElementChecked: boolean, glyph: Element}) => {
        const glyph: string | undefined = props.isElementChecked ? props.glyph.text :  props.glyph.secondaryText;
        const glyphColour: string = "rgb(255, 215, 95)";
        
        const Div = Sinda.Div;
        const P = Sinda.P;

        return <>
            <Div style={{paddingTop: 0.5, paddingBottom:0.5, justifyContent:"flex-start"}}>
                {glyph && <P style={{color:glyphColour}}>{glyph} </P>}
                <Visual isFocused={props.isFocused} focusColour={props.element.secondaryColourization as GradientTheme}>{props.element.text}</Visual>
            </Div>
        </>
}
export default Checkbox;