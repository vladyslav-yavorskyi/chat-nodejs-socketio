export {};

const express = require('express');
const User = require('../schemas/user');
const { signIn } = require('../validation/user');
const { parseError, sessionizeUser } = require('../util/helpers');

const sessionRouter = express.Router();

// add session
sessionRouter.post('', async (req, res) => {
  try {
    const { email, password } = req.body;
    await signIn.validateAsync({ email, password });
    const user = await User.findOne({ email });
    if (user && user.comparePasswords(password)) {
      const sessionUser = sessionizeUser(user);

      req.session.user = sessionUser;
      res.send(sessionUser);
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
sessionRouter.get('', ({ session: { user } }, res) => {
  res.send({ user });
});

module.exports = sessionRouter;