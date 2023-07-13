const MessageMod = require('../schemas/messages');
const UserMod = require('../schemas/user');

const ioEvents = (socketIO) => {
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

    // socket.on('typingMessage', (data) => {
    //   socket.broadcast.emit('typingResponse', data);
    // });

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
      const user = new UserMod({
        username: data.userName,
        socketId: socket.id,
      });

      user.save().then(() => {
        UserMod.find({})
          .then((UserMods) => {
            socketIO.emit('UserMods', UserMods);
          })
          .catch((error) => console.log(error));
      });
    });

    socket.on('disconnect', (data) => {
      console.log('🔥: A user disconnected');
    });
  });
};

const initSocket = (app) => {
  const server = require('http').createServer(app);
  const io = require('socket.io')(server, {
    cors: {
      origin: 'http://localhost:3000',
    },
  });

  // Allow sockets to access session data
  io.use((socket, next) => {
    require('../session')(socket.request, {}, next);
  });

  ioEvents(io);

  return server;
};

module.exports = initSocket;
