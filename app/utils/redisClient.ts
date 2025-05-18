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
