const sessionReq = require('express-session');
const dbUrl = require('../db');
const MongoDBStore = require('connect-mongo')(sessionReq);

const MAX_AGE = 1000 * 60 * 60 * 3;

const mongoDBstore = new MongoDBStore({
  mongoUrl: dbUrl,
  ttl: MAX_AGE,
  autoRemove: 'native',
});

const init = () => {
  return sessionReq({
    secret: 'qwertyui123',
    resave: true,
    store: mongoDBstore,
    cookie: {
      maxAge: MAX_AGE,
      sameSite: false,
      secure: false,
    },
    saveUninitialized: true,
  });
};

module.exports = init();
