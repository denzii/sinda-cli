import React, { Context, createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
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
import figlet from "figlet";
/** @ts-ignore */
import patchConsole from "patch-console";
import { AppContext } from '../model/appContext.js';
import RouteContext from '../model/routeContext.js';
import Gradient from 'ink-gradient';
import { RouterContext } from './app.js';
// import { useNavigate } from "react-router-dom";
import  isAdmin from "is-admin";
import { exit } from 'process';
import Shell from '../model/shell.js';
import ShellResponse from '../model/shellResponse.js';
import Executable, { ShellType } from '../model/executable.js';
import Env, { HostPlatform } from '../model/env.js';

const Index = () => {
	const [ctaVisibility, toggleCtaVisibility] = useState(true);
	const ctx = useContext(RouterContext);
    const [isElevated, setIsElevated] = useState<boolean|undefined>(undefined);
    useInput((input, key) => {
        if (isElevated){
            ctx!.router((RouteContext.Survey));
        } else exit()
	});
    
    useEffect(() => {
        /**@todo execute task earlier and just receive answer from worker */
        if (process.HostPlatforms.includes(HostPlatform.Windows)){
            const response: ShellResponse = Shell.RunSync([new Executable(ShellType.Powershell, ".", [Env.PSFuncPath(), "Test-Elevation"])])[0];
            if (["True", "False"].includes(response.std.stdout!)){
                const isElevated: boolean = response.std.stdout?.toLowerCase().trim() == "true";
                setIsElevated(isElevated);
            }
        } else if (process.HostPlatforms.includes(HostPlatform.Unix)) setIsElevated(true);

		const ctaAnimation: NodeJS.Timer = setInterval(() => { toggleCtaVisibility(visibility => !visibility) }, 1000);
		return () => {clearInterval(ctaAnimation);};
    },[]);

	const bannerStyles: figlet.Options = {font: 'Ogre', width:70, horizontalLayout: 'default',verticalLayout: 'universal smushing', whitespaceBreak: false}
	const banner = figlet.textSync('Sinda !', bannerStyles);

    const Div = Sinda.Div;
    const P = Sinda.P;
    const Br = Sinda.Br;
    return <>
        <Div style={{flexDirection:"column", width:"30%"}}>
            <Div style={{height:"10px"}}><></></Div>
            
            <Div style={merge([{display:"flex", justifyContent:"flex-start"}])}>
                <P>Welcome To</P>
            </Div>

            <Div style={merge([{display:"flex",  justifyContent:"flex-start",}])}>
                <P>{banner}</P>
            </Div>

            <Div style={merge([{ height:"12px", justifyContent:"flex-start"}])}>
                    <P>
                        Your  
                        <Gradient name="cristal"> <P> fullstack </P> </Gradient>
                        framework!
                    </P>
            </Div>

            <Div style={merge([{ height:"14px", justifyContent:"flex-start", marginTop: "2px"}, {}])}>
            {(!(undefined == isElevated) && !isElevated) 
                ? <>
                    <Div style={{flexDirection:"column", width:"90%", justifyContent:"center"}}>
                        <Gradient name='fruit'>
                            <P>This app requires Admin :/</P>
                        </Gradient>
                        <Br/>
                        <Div style={{flexDirection:"column", justifyContent:"center", display: ctaVisibility ? "flex" : "none"}}>
                            <P>Press any key to terminate session...</P>
                        </Div>
                    </Div>
                </>
                :<>
                    <Div style={{flexDirection:"column", justifyContent:"center", display: ctaVisibility ? "flex" : "none"}}>
                        {isElevated 
                            ? <P>Press any key to start...</P>
                            : <P style={{dimColor:true}}>...Fetching terminal session admin status...</P>}           
                    </Div>
                </>}
			</Div>
        </Div>
    </>
}

export default Index;