import {Server, Socket} from "socket.io";

const {saddAsync, sremAsync, smembersAsync} = require('../redis/index');
const MessageMod = require('../schemas/messages');
const UserMod = require('../schemas/user');
const client = require('../redis/index');


interface User {
    id: string;
    name: any;
}


const ioEvents = (socketIO: Server) => {
    socketIO.on('connection', async (socket: Socket) => {
        console.log(`⚡: ${socket.id} user just connected!`);
        // @ts-ignore
        const user: User = {name: socket.request.session.user.username};

        // Add the user's ID to the Redis set
        // @ts-ignore
        await saddAsync('active_users', socket.request.session.user.id);

        // Emit the list of active users
        const activeUsers = await smembersAsync('active_users');
        socketIO.emit('activeUsers', activeUsers);

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
            // Remove the user's ID from the Redis set
            // @ts-ignore
            await sremAsync('active_users', socket.request.session.user.id);

            // Emit the updated list of active users
            const updatedActiveUsers = await smembersAsync('active_users');
            socketIO.emit('activeUsers', updatedActiveUsers);
            console.log('🔥: A user disconnected');
        });
    });
};

module.exports = ioEvents;