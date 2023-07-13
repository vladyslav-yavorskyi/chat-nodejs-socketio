export {};

const mongoose = require('mongoose');
const { compareSync, hashSync } = require('bcryptjs');

// define our user schema for mongoDB + validate
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      validate: {
        validator: (username) => User.doesNotExist({ username }),
        message: 'Username already exist',
      },
    },
    email: {
      type: String,
      validate: {
        validator: (email) => User.doesNotExist({ email }),
        message: 'Email already exists',
      },
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// pre-hook; runs before we save our user
userSchema.pre('save', function () {
  if (this.isModified('password')) {
    this.password = hashSync(this.password, 10);
  }
});

// custom validator for userSchema; check if user exist or not
userSchema.statics.doesNotExist = async function (field) {
  return (await this.where(field).countDocuments()) === 0;
};

// compare passwords
userSchema.methods.comparePasswords = function (password) {
  return compareSync(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
