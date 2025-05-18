import { createClient, RedisClientType } from 'redis';

export async function getRedisClient() {
  try {
    const redisClient = await createClient({
      url: process.env.REDIS_URL,
    }).connect();

    return redisClient;
  } catch (error) {
    console.log('Error @ getRedisClient: ', error);

    return null;
  }
}

// const redis = await createClient({ url: process.env.REDIS_URL }).connect();
// const redisClient = await createClient({
//   url: process.env.REDIS_URL,
// })
//   .connect()
//   .then(() => {
//     console.log('Redis connected successfully!');
//     return redisClient;
//   })
//   .catch((error) => {
//     console.log('Error @ redisClient: ', error);
//   });

// export default redisClient;
