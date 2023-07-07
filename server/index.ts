const express = require('express');
const app = express();
const mongoose = require('mongoose');
const db = `mongodb+srv://vicktoria:test123@chat.wzg0wdk.mongodb.net/chat?retryWrites=true&w=majority`;
const MessageMod = require('./models/messages');
const ActiveMod = require('./models/actives');

const http = require('http').Server(app);
const cors = require('cors');

const PORT = 4000;

mongoose
  .connect(db, { useUnifiedTopology: true })
  .then(() => {
    http.listen(PORT, () => {
      console.log(`Listening on server: ${PORT}`);
      console.log(`http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log(err));

app.use(cors);

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
        console.log('Error mONGO', error);
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

  socket.on('loadUsers', () => {
    ActiveMod.find().then((result) => {
      socket.emit('activeUsers', result);
    });
  });

  // add new user
  socket.on('newUser', (data) => {
    const user = new ActiveMod({
      userName: data.userName,
      socketId: socket.id,
    });

    user.save().then(() => {
      ActiveMod.find()
        .then((result) => {
          socketIO.emit('newUserResponse', result);
        })
        .catch((error) => console.log(error));
    });
  });

  socket.on('disconnect', (data) => {
    console.log('🔥: A user disconnected');
    ActiveMod.deleteOne({ socketId: socket.id }).then((data) => {
      console.log(data);
    });
    // socket.on('leaveChat', (userName) => {
    //   ActiveMod.deleteOne({ userName }).then(() => {
    //     console.log(userName, ' was deleted');
    //   });
    // });
  });
});

app.get('/');
