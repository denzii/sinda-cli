import React, { useEffect, useState } from "react";
import {RenderContext} from "../renderContext.js";
import {merge} from "../util.js";
import Style from "../../style/index.js";
import Sinda from "./sinda.js";
import { HigherOrderConstructor } from "./context.js";
import { Box, useStdout, Text } from "ink";

const Responsive: (props: {children?: React.ReactNode}) => JSX.Element = (props) => {
    const [dimension, setScreenDimensions] = useState({ width: process.stdout.columns, height: process.stdout.rows });
    // const {stdout, write} = useStdout();

    useEffect(() => {

        const onResize = () => setScreenDimensions({ width: process.stdout.columns, height: process.stdout.rows });

        process.stdout.on("resize", onResize);
        // process.stdout.write("\x1b[?1049h");
        return () => { process.stdout.off("resize", onResize); }
    }, []);
    
    const Div = Sinda.Div;
    return <>
        <Div style={merge([Style.centeredFlexContainerRules(dimension), Style.BlockOutlineModifier()])}>
            {props.children}
        </Div>
    </>
};

type JSXConstructor = (props?: any) => JSX.Element;

const withLayout = (TargetComponent: JSXConstructor) => {
    return (props: any) => <>
        <Responsive>       
            <TargetComponent {...props} />
        </Responsive>
    </>
}
    
export {withLayout, Responsive};