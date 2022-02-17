import {  Box, Newline, Text } from "ink";
import React, { useContext } from "react";
import InkDivStyles from "../../type/inkDivStyles.js";
import InkTextStyles from "../../type/InkTextStyles.js";
import { RenderContext } from "../renderContext.js";

export type Styles =  React.HTMLAttributes<HTMLDivElement> | InkDivStyles | InkTextStyles;
export type Children = JSX.Element[] | JSX.Element | string[] | string |  React.ReactNode | undefined;

export interface Props { 
    children: Children,
    style?: Styles, 
    context?: RenderContext, 
}

export default class Sinda {
    public static Div(props: Props): JSX.Element{
        const context = useContext(process.ReactContext);
        switch (context) {
            case RenderContext.None:
                return  <> 
                    <Box {...props.style}>{props.children}</Box>
                </>
            default:
                return <>
                    <div {...props.style}>{props.children}</div>
                </>;
        };
    };

    public static P(props: Props): JSX.Element{
        const context = useContext(process.ReactContext);
        switch (context) {
            case RenderContext.None:
                return  <>
                    <Text {...props.style}>{props.children}</Text>
                </>
            default:
                return <>
                    <p {...props.style}>{props.children}</p>
                </>;
            }
    };

    public static Br(): JSX.Element{
    const context = useContext(process.ReactContext);
    switch (context) {
        case RenderContext.None:
            return <>
                <Newline/>
            </>
        default:
            return <>
                <br/>
            </>;
        }
    };
    
};


// export {div, p, br}

// declare global {
// 	namespace JSX {
// 		interface IntrinsicElements {
// 			sinda: Sinda.BaseComponentChildren;
// 		}
// 	}
// }

// declare namespace Sinda {
// 	export interface BaseComponentChildren {
// 		children?: ComponentChildren;
// 	}
// }


  
// const div = (props: Props) => {
//     const validate: (componentContext: Context, componentProps?: Props) => void = (componentContext, componentProps) => {
//         if (null == componentProps?.style) return;
//         if (componentContext != componentProps.context) 
//           throw new Error(`You are trying to use a component on ${componentContext} but supplying props for its ${componentProps.context} version`)
//     };
    
//     validate(process.env.RenderContext, props);
    
//     switch (props.context) {
//         case Context.Terminal:
//             return  <>
//                 <Box {...props.style}>{props.children}</Box>
//             </>

//         case Context.Mobile:
//           throw new Error("this does not work on mobile yet");
    
//         default:
//             return <>
//                 <div {...props.style}>{props.children}</div>
//             </>;
//     }
// }

// const p = (props: Props) => {
//     //@TODO get this from react context
//     switch (/*props.context*/"Terminal" as Context) {
//         case Context.Terminal:
//             return  <>
//                 <Text {...props.style}>{props.children}</Text>
//             </>

//         case Context.Mobile:
//           throw new Error("this does not work on mobile yet");
    
//         default:
//             return <>
//                 <p {...props.style}>{props.children}</p>
//             </>;
//     }
// }

// const br = () => <Newline/>