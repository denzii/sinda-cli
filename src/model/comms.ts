//@ts-ignore no ts for this
// import {isPortReachable} from "is-port-reachable";
import chalk from "chalk";
import { WorkerStatus } from "./hook";
import { exit } from "process";
import axios from "axios";
import {Worker} from "cluster";

export default class Comms {
    public static PingWorker: (worker: Worker) => Promise<void>= async(worker) => {
        // const defaultHost = "localhost";
        // const host = process.env.BackendAddress ??  defaultHost;
        
        // const defaultPort = 8080;
        // const port = Number(process.env.BackendPort) ?? defaultPort;

        // const address: string =`http://${host}:${port}/`;

        // try{
        //     const response = await axios.get(address);
        //     console.log("Axios", response)
        // }catch(error: any){
        //     if (error.response) {
        //         console.log(error.response.data);
        //         console.log(error.response.status);
        //         console.log(error.response.headers);
        //      }
        // }

        // console.log(worker);
        worker.send("Hi");

        // return Number(isAlive) as ServerStatus;
        // const x = ping.createSession().pingHost(host, (error:any, target: any) => {
        //     const offlineMessage = chalk.red(target + ": Not alive", error.toString());
        //     const onlineMessage = chalk.green(target + ": Alive");
        //     const displayMessageAndReturn:(online: boolean) => boolean = (online: boolean) => {
        //         online ? console.log(offlineMessage): console.log(onlineMessage);
        //         return online;
        //     };
            
        //     if (error instanceof ping.RequestTimedOutError || error instanceof ping.DestinationUnreachableError || error instanceof ping.TimeExceededError) 
        //      return  displayMessageAndReturn(false);
        //      else return displayMessageAndReturn(true);
        // });
        
        // return ServerStatus.Offline
    }
}