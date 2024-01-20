require('dotenv').config();

const sessionReq = require('express-session');
const dbUrl = process.env.DB_URI;
const MongoDBStore = require('connect-mongo');

const MAX_AGE = 1000 * 60 * 60 * 3;

const initSession = sessionReq({
    name: 'session',
    secret: 'qwertyui123',
    store: MongoDBStore.create({
        mongoUrl: dbUrl,
        collection: 'session',
    }),
    cookie: {
        maxAge: MAX_AGE,
        sameSite: true,
        secure: false,
        httpOnly: true,
    },
    resave: false,
    saveUninitialized: false,
});


const corsConfig = {
    origin: 'http://localhost',
    optionsSuccessStatus: 200,
    credentials: true,
};

module.exports = {initSession, corsConfig};
