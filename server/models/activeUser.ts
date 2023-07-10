export {};

const mongooseMod = require('mongoose');

const activeUserSchema = new mongooseMod.Schema({
  socketId: String,
  username: String,
});

const Active = mongooseMod.model('user', activeUserSchema);

module.exports = Active;
