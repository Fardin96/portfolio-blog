import { createClient } from 'redis';

// const redis = await createClient({ url: process.env.REDIS_URL }).connect();
const redisClient = await createClient({
  url: process.env.REDIS_URL,
}).connect();

export default redisClient;
