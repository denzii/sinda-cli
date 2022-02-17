import { Context, createContext, ReactElement } from "react";
import { RenderContext } from "../renderContext";
import React from "react"
import { merge } from "../util";

export type ComponentDataConnector = (mergeProps: PropsReducer) => HigherOrderConstructor;
export type PropsReducer = (props: any) => any;
export type HigherOrderConstructor = (targetComponent: BaseJSXConstructor) => (props: any) => JSX.Element;
export type BaseJSXConstructor = (props: any) => JSX.Element;
export type ContextProvider = (TargetComponent: BaseJSXConstructor) => (props: any) => JSX.Element;

// const getAppContext = () => {
//     const renderContext = process.env.RenderContext;
//     const executionContext = process.env.ExecutionContext;
    

//     if (!renderContext || !executionContext){
        
//     }
// }


export const getBaseProps: PropsReducer = (baseProps: object) => ({ ...baseProps });


const ReactContext: Context<RenderContext|undefined> = createContext<RenderContext| undefined>(undefined);

// export const contextAware = (TargetComponent: () => ReactElement<AppContext>, componentProps: {context:AppContext}) => {
//     return (props: AppContext) => 
//         <Context.Provider value={componentProps.context}>       
//             <TargetComponent {...{context: props}} />
//         </Context.Provider>
// }
    
export const provider: ComponentDataConnector = (getProps: PropsReducer = getBaseProps) => (TargetComponent: BaseJSXConstructor) => {
    return (props: RenderContext) => 
        <ReactContext.Consumer>
            {(context?: RenderContext) => {
                if (!context) 
                    throw Error(`Context is undefined at the ${TargetComponent.name} component. This is caused either by omitting a default value for context or not setting a provider for it.`);
                
                const contextProps = getProps(context);
                return <TargetComponent {...(merge([contextProps, props]))} />
            }}
        </ReactContext.Consumer>
}

