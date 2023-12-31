const config = require('../config');
const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

/**
 * Encapsulates all code for authentication
 * Either by using username and password, or by using social accounts
 *
 */
const init = function () {
  // Serialize and Deserialize user instances to and from the session.
  passport.serializeUser(function (user, done) {
    done(null, user.userId);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  // Plug-in Local Strategy
  passport.use(
    new LocalStrategy(function (username, password, done) {
      User.findOne(
        { username: new RegExp(username, 'i'), socialId: null },
        function (err, user) {
          if (err) {
            return done(err);
          }

          if (!user) {
            return done(null, false, {
              message: 'Incorrect username or password.',
            });
          }

          user.validatePassword(password, function (err, isMatch) {
            if (err) {
              return done(err);
            }
            if (!isMatch) {
              return done(null, false, {
                message: 'Incorrect username or password.',
              });
            }
            return done(null, user);
          });
        }
      );
    })
  );

  return passport;
};

module.exports = init();
