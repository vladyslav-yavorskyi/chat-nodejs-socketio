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
const {getRedisClient} = require('./redis/index');

const server = require('http').createServer(app);
const {Server} = require('socket.io');
const redis = require('redis');
const PORT = process.env.PORT;
const dbURI = process.env.DB_URI;

let redisClient = redis.createClient({
    url: process.env.REDIS_URL
});

(async () => {
    try {
        mongoose.Promise = global.Promise;
        await mongoose.connect(dbURI, {useNewUrlParser: true});
        // const redisClient = getRedisClient();

        console.log('MongoDB connected 🔥');
        const io = new Server(server, {
            cors: corsConfig,
        })

        console.log('Redis client connecting...', process.env.MODE === 'production' ? process.env.REDIS_URL : process.env.REDIS_URL_LOCAL)
        await redisClient.connect().then(() => console.log('Redis client connected'));
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

        ioSocket(io, redisClient);

        server.listen(Number(PORT), () =>
            console.log(`⚡ Listening on port http://localhost:${PORT}`)
        );
    } catch (err) {
        console.log(err);
    }
})();
