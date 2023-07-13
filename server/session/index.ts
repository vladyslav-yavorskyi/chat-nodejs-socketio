require('dotenv').config();

const sessionReq = require('express-session');
const dbUrl = process.env.DB_URI;
const MongoDBStore = require('connect-mongo');

const MAX_AGE = 1000 * 60 * 60 * 3;

const initSession = () => {
  return sessionReq({
    secret: 'qwertyui123',
    resave: true,
    store: new MongoDBStore({
      mongoUrl: process.env.DB_URI,
      collection: 'session',
    }),
    cookie: {
      maxAge: MAX_AGE,
      sameSite: false,
      secure: false,
    },
    saveUninitialized: false,
  });
};

module.exports = initSession();
