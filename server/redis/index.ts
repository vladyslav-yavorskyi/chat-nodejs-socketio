import {RedisClientType} from "redis";
import {promisify} from "node:util";

const redis = require('redis');
const client: RedisClientType = redis.createClient();


let saddAsync, sremAsync, smembersAsync;

(
    async () => {
        try {
            await client.connect();

            client.on('connect', () => {
                console.log('Redis client connected');

                // Promisify the Redis commands for use with async/await
                saddAsync = promisify(client.sAdd).bind(client);
                sremAsync = promisify(client.sRem).bind(client);
                smembersAsync = promisify(client.sMembers).bind(client);
            });
            console.log('Redis connected 🔥');
        } catch (err) {
            console.log(err);
        }
    }
)();

module.exports = {client, saddAsync, sremAsync, smembersAsync};