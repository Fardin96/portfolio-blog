import { createClient, RedisClientType } from 'redis';

export async function getRedisClient(): Promise<RedisClientType | null> {
  try {
    const redisClient = (await createClient({
      url: process.env.REDIS_URL,
    }).connect()) as RedisClientType;

    return redisClient;
  } catch (error) {
    console.log('Error @ getRedisClient: ', error);

    return null;
  }
}
