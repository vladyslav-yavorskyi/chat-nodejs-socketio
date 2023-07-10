const express = require('express');
const app = express();
const mongoose = require('mongoose');
const db = require('./db');
const MessageMod = require('./models/messages');
const ActiveUser = require('./models/activeUser');
const session = require('./session');
const http = require('http').Server(app);
const cors = require('cors');

const PORT = 4000;

app.use(cors);
app.use(session);

const socketIO = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

socketIO.on('connection', (socket) => {
  socket.on('loadMessages', () => {
    MessageMod.find()
      .then((result) => {
        socket.emit('outputMessages', result);
      })
      .catch((error) => {
        console.log('Error Mongo', error);
      });
  });

  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on('typingMessage', (data) => {
    socket.broadcast.emit('typingResponse', data);
  });

  socket.on('message', (data) => {
    const msg = new MessageMod({
      message: data.text,
      name: data.name,
      socketId: data.socketId,
    });
    msg.save().then(() => {
      socketIO.emit('messageResponse', {
        message: data.text,
        name: data.name,
        socketId: data.socketId,
      });
    });
  });

  // add new user
  socket.on('newUser', (data) => {
    const user = new ActiveUser({
      username: data.userName,
      socketId: socket.id,
    });

    user.save().then(() => {
      ActiveUser.find({})
        .then((activeUsers) => {
          socketIO.emit('activeUsers', activeUsers);
        })
        .catch((error) => console.log(error));
    });
  });

  socket.on('disconnect', (data) => {
    console.log('🔥: A user disconnected');
    ActiveUser.findOneAndDelete({ socketId: socket.id }).then(() => {
      ActiveUser.find({}).then((updatedActiveUsers) => {
        socketIO.emit('activeUsers', updatedActiveUsers);
      });
    });
  });
});

app.get('/', (req, res, next) => {
  req.session.user = {
    uuid: '12234-2345-2323423',
  }; //THIS SETS AN OBJECT - 'USER'
  req.session.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.send(req.session.user); // YOU WILL GET THE UUID IN A JSON FORMAT
    }
  }); //THIS S
});

mongoose
  .connect(db, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => {
    http.listen(PORT, () => {
      console.log(`Listening on server: ${PORT}`);
      console.log(`http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log(err));
