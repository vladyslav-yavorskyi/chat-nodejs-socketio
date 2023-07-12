require('dotenv').config();

const sessionReq = require('express-session');
const dbUrl = require('../database');
const MongoDBStore = require('connect-mongo');

const MAX_AGE = 1000 * 60 * 60 * 3;

const initSession = () => {
  return sessionReq({
    secret: 'qwertyui123',
    resave: true,
    store: new MongoDBStore({
      mongooseConnection: dbUrl.Mongoose.connection,
      mongoUrl: process.env.DB_URI,
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
