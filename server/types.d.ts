import {Socket} from 'socket.io';
import {IncomingMessage} from 'http';
import {DefaultEventsMap} from "socket.io/dist/typed-events";

interface CustomRequest extends IncomingMessage {
    session: {
        user: {
            username: string;
        };
    };
    // Add any additional properties you need here
}

export interface SocketsWithSession extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {
    request: CustomRequest
}