require('dotenv').config();

const Mongoose = require('mongoose');
const dbURI = process.env.DB_URI;

// Mongoose.connect(dbURI, { useNewUrlParser: true });

// Throw an error if the connection fails
Mongoose.connection.on('error', function (err) {
  if (err) throw err;
});

module.exports = {
  Mongoose,
  models: {
    user: require('./schemas/user.ts'),
    room: require('./schemas/messages.ts'),
  },
};
