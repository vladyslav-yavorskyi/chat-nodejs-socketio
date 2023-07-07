export {};

const mongooseMod = require('mongoose');

const activeSchema = new mongooseMod.Schema({
  userName: {
    type: String,
    required: true,
  },
  socketId: {
    type: String,
    required: true,
  },
});

const Active = mongooseMod.model('user', activeSchema);

module.exports = Active;
