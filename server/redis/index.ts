const redis = require('redis');

let redisClient;

async function createRedisClient() {
    redisClient = await redis.createClient({
        url: process.env.REDIS_URL, // Use environment variables for configuration
        // Add other configurations as necessary
    });

    await redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.on('connect', () => console.log('Redis client connected'));
    await redisClient.on('end', () => console.log('Redis client disconnected'));

    return redisClient;
}

module.exports = {
    getRedisClient: async () => {
        if (!redisClient) {
            redisClient = await createRedisClient();
        }
        return redisClient;
    },
};
