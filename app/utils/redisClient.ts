import { createClient } from 'redis';

// const redis = await createClient({ url: process.env.REDIS_URL }).connect();
const redisClient = await createClient({
  url: process.env.REDIS_URL,
})
  .connect()
  .then(() => {
    console.log('Redis connected successfully!');
    return redisClient;
  })
  .catch((error) => {
    console.log('Error @ redisClient: ', error);
  });

export default redisClient;
