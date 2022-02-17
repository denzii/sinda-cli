import { useState, useEffect } from 'react';
import * as ping from "ping";
import Comms from '../comms';

export enum CommsProtocol { WebSocket, Http }
export type Config = { protocol: CommsProtocol}
export enum WorkerStatus { Offline, Online }

export default class Hook {
    public static Server: (options: Config) => void = (opt) => {
        const initialState = WorkerStatus.Offline as WorkerStatus;
        // const [isOnline, toggleServerStatus]: [ServerStatus, (status: ServerStatus) => void] = useState(initialState);

        useEffect(() => {
            // const handleStatusChange = (status: ServerStatus) => toggleServerStatus(status);

            // Comms.PingWorker(friendID, handleStatusChange);
            // const response = Comms.PingWorker();
            // toggleServerStatus(response);
            // console.log("state changed, response: {active: boolean} = ", response);
            // return () => {
            //   ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
            // };
        });
    }

}

const useServer: (options: Config) => void = (opt) => {
    const initialState = WorkerStatus.Offline as WorkerStatus;
    // const [isOnline, toggleServerStatus]: [ServerStatus, (status: ServerStatus) => void] = useState(initialState);

    useEffect(() => {
        // const handleStatusChange = (status: ServerStatus) => toggleServerStatus(status);

        // Comms.PingWorker(friendID, handleStatusChange);
        // const response = Comms.PingWorker();
        // toggleServerStatus(response);
        // console.log("state changed, response: {active: boolean} = ", response);
        // return () => {
        //   ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
        // };
    });
}
export {useServer};