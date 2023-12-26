import {createClient} from "redis";
import {createAdapter} from "@socket.io/redis-adapter";

require('dotenv').config();
export {};

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const {initSession, wrap, corsConfig, getSession} = require('./session');
const cors = require('cors');
const ioSocket = require('./socket/index');
const userRoutes = require('./routes/user');
const sessionRoutes = require('./routes/session');
const cookieParser = require('cookie-parser');

const server = require('http').createServer(app);
const {Server} = require('socket.io');

const PORT = process.env.PORT;
const dbURI = process.env.DB_URI;

(async () => {
    try {
        mongoose.Promise = global.Promise;
        await mongoose.connect(dbURI, {useNewUrlParser: true});
        console.log('MongoDB connected 🔥');
        const io = new Server(server, {
            cors: corsConfig,
        })

        const pubClient = createClient({url: "redis://localhost:6379"});
        const subClient = pubClient.duplicate();


        // hide from hackers what stack we use
        app.disable('x-powered-by');
        app.use(cors(corsConfig));
        app.use(express.json());
        app.use(cookieParser());

        app.use(initSession);
        io.engine.use(initSession);


        const apiRouter = express.Router();
        app.use('/api', apiRouter);
        apiRouter.use('/session', sessionRoutes);
        apiRouter.use('/users', userRoutes);
        io.adapter(createAdapter(pubClient, subClient));
        ioSocket(io);

        server.listen(Number(PORT), () =>
            console.log(`⚡ Listening on port http://localhost:${PORT}`)
        );
    } catch (err) {
        console.log(err);
    }
})();