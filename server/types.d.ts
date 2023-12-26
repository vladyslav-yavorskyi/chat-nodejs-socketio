declare module 'http' {
    import {Session} from "express-session";

    interface IncomingMessage {
        session: Session;
    }
}