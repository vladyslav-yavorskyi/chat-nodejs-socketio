const Joi = require('@hapi/joi');

const email = Joi.string().email().required();
const username = Joi.string().alphanum().min(3).max(30).required();

const password = Joi.string().regex(
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/
);

const signUp = Joi.object().keys({
  email,
  username,
  password,
});

const signIn = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

module.exports = { signIn, signUp };
