const { signUp } = require('../validation/user');
import User from './user';
const userRoutes = require('express').Router();

userRoutes.post('', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    await signUp.validateAsync({
      username,
      email,
      password,
    });

    // save new user with validators

    const newUser = new User({ username, email, password });
    await newUser.save();
    res.send({ userId: newUser.id, username });
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = userRoutes;
