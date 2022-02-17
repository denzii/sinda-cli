// import { Static, useStdout, Text } from "ink";
// import React, { useEffect, useLayoutEffect, useState } from "react";
// import Sinda  from "./sinda.js";
// /**@ts-ignore */
// import patchConsole from 'patch-console';

// type JSXConstructor = (props?: any) => JSX.Element;


// const Stdout: (props: {children?: React.ReactNode}) => JSX.Element = (props) => {
//     const initialState: string[] = []
//     const [stds, writeStd] = useState(initialState);

//     useEffect(() => {
//         patchConsole((stream:string, data:string) => {
//             writeStd((stds: string[]) => [...stds, data]);
//         });
        
//     });
//     const Div = Sinda.Div
//     return <>
//         <Static items={stds}>
//             {std => <Text>{std}</Text>}    
//         </Static>
//         <Div>
//             {props.children}
//         </Div>
//     </>
// };

// const withStdout = (TargetComponent: JSXConstructor) => {
//     return (props: any) => <>
//         <Stdout>       
//             <TargetComponent {...props} />
//         </Stdout>
//     </>
// }

// export {Stdout, withStdout}