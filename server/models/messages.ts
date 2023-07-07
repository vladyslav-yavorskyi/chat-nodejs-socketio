const mongooseMod = require('mongoose');

const messageSchema = new mongooseMod.Schema({
  message: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  socketId: {
    type: String,
    required: true,
  },
});

const Message = mongooseMod.model('message', messageSchema);

module.exports = Message;
