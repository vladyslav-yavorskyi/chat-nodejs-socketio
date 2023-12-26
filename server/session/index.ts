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
    saveUninitialized: false,
});


const corsConfig = {
    origin: 'http://localhost:3000',
    credentials: true,
};

module.exports = {initSession, corsConfig};
