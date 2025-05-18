import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient
  .connect()
  .catch((error) => console.log('Error @ redisClient: ', error));

export default redisClient;
