import {Server, Socket} from "socket.io";
import {RedisClientType} from "redis";

const MessageMod = require('../schemas/messages');
const UserMod = require('../schemas/user');

// const redisClient = require('../index');


interface User {
    id: string;
    name: any;
}


const ioEvents = (socketIO: Server, redisClient: RedisClientType) => {
    socketIO.on('connection', async (socket: Socket) => {
        console.log(`⚡: ${socket.id} user just connected!`);
        // @ts-ignore
        const user: User = {name: socket.request.session.user.username};

        // Add the user's ID to the Redis set
        // @ts-ignore
        const fieldsAdded = await redisClient.hSet(
            'bike:1',
            {
                // @ts-ignore
                user: socket.request.session.user.username,
                brand: 'Ergonom',
                type: 'Enduro bikes',
                price: 4972,
            },
        )
        console.log(`Number of fields were added: ${fieldsAdded}`);
        const bike = await redisClient.hGetAll('bike:1');
        console.log(bike);
        // Emit the list of active users
        // let activeUsers = await redisClient.hGetAll('active_users')
        // console.log(JSON.stringify(activeUsers, null, 2));
        // socketIO.emit('activeUsers', activeUsers);

        socket.on('loadMessages', async () => {
            try {
                const messages = await MessageMod.find({});
                socket.emit('outputMessages', messages);
            } catch (error) {
                console.log(error);
            }
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

            // @ts-ignore
            // await redisClient.sRem('active_users', {username: socket.request.session.user.username});
            // Emit the updated list of active users
            console.log('🔥: A user disconnected');
        });
    });
};

module.exports = ioEvents;