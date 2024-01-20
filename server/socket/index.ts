import {Server} from "socket.io";
import {RedisClientType} from "redis";
import {SocketsWithSession} from "../types";

const MessageMod = require('../schemas/messages');
const UserMod = require('../schemas/user');


const ioEvents = (socketIO: Server, redisClient: RedisClientType) => {
    socketIO.on('connection', async (socket: SocketsWithSession) => {
        console.log(`⚡: ${socket.id} user just connected!`);
        console.log(`🔥: ${socket.request.session.user.username} just connected!`);

        await redisClient.sAdd(
            'active_users',
            socket.request.session.user.username
        )
        const activeUsers = await redisClient.sMembers('active_users');
        console.log(`Active users: ${activeUsers}`);

        socketIO.emit('activeUsers', activeUsers);

        socket.on('loadMessages', async () => {
            try {
                const messages = await MessageMod.find({});
                socket.emit('outputMessages', messages);
            } catch (error) {
                console.log(error);
            }
        });

        socket.on('typing', (username: string) => {
            socket.broadcast.emit('userTyping', username);
        });

        socket.on('stopTyping', (username: string) => {
            socket.broadcast.emit('userStoppedTyping', username);
        });


        socket.on('message', (data: any) => {
            const msg = new MessageMod({
                message: data.text,
                name: data.name,
                socketId: data.socketId,
            });
            msg.save().then(() => {
                console.log('Message saved')
                socketIO.emit('messageResponse', msg);
            }).catch((error: any) => console.log(error));
        });

        socket.on('newUser', (data: any) => {
            const user = new UserMod({
                username: data.userName,
                socketId: socket.id,
            });

            user.save().then(() => {
                UserMod.find({})
                    .then((UserMods: any) => {
                        socketIO.emit('UserMods', UserMods);
                        socketIO.emit('activeUser', UserMods);
                    })
                    .catch((error: any) => console.log(error));
            });
        });

        socket.on('disconnect', async () => {
            await redisClient.sRem('active_users', socket.request.session.user.username);
            // Emit the updated list of active users to all connected sockets
            const activeUsers = await redisClient.sMembers('active_users');
            socketIO.emit('activeUsers', activeUsers);
            console.log('🔥: A user disconnected');
        });
    });
};

module.exports = ioEvents;