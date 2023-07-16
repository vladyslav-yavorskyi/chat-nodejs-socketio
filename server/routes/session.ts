export {};

const express = require('express');
const User = require('../schemas/user');
const { signIn } = require('../validation/user');
const { parseError, sessionizeUser } = require('../util/helpers');

const sessionRouter = express.Router();

// add session
sessionRouter.post('', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    await signIn.validateAsync({ email, password });
    const user = await User.findOne({ email });
    if (user && user.comparePasswords(password)) {
      const sessionUser = sessionizeUser(user);

      req.session.user = sessionUser;
      await req.session.save((err) => {
        if (err) throw err;
        console.log(req.session, 'fds');

        res.send(sessionUser);
      });
    } else {
      throw new Error('Invalid login credentials');
    }
  } catch (err) {
    res.status(401).send(parseError(err));
  }
});

// delete session
sessionRouter.delete('', ({ session }, res) => {
  try {
    const user = session.user;
    if (user) {
      session.destroy((err) => {
        if (err) throw err;

        res.clearCookie('sessions');
        res.send(user);
      });
    } else {
      throw new Error('Something went wrong');
    }
  } catch (err) {
    res.status(422).send(parseError(err));
  }
});

// check if user is logged in
sessionRouter.get('/isAuth', async (req, res) => {
  if (req.session.user) {
    return res.json(req.session.user);
  } else {
    return res.status(401).json('unauthorize');
  }
});

module.exports = sessionRouter;
