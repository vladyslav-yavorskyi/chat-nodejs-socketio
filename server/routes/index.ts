export {};

const { signUp } = require('../validation/user');
const { parseError, sessionizeUser } = require('../util/helpers');
const User = require('../schemas/user');
const userRoutes = require('express').Router();

userRoutes.post('', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    await signUp.validateAsync({
      username,
      email,
      password,
    });

    // save new user and sessionize our data
    const newUser = new User({ username, email, password });
    const sessionUser = sessionizeUser(newUser);
    await newUser.save();

    req.session.user = sessionUser;
    console.log(req.session);
    res.send(sessionUser);
  } catch (err) {
    // send parsed Error; better to read
    res.status(400).send(parseError(err));
  }
});

module.exports = userRoutes;
