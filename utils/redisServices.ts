import { createClient, RedisClientType } from 'redis';

/**
 ** GET REDIS CLIENT
 * @returns RedisClientType | null
 */

let redisClient: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType | null> {
  try {
    // check for existing redis connection
    if (redisClient && redisClient?.isReady) {
      return redisClient;
    }

    // create new redis connection if not connected
    redisClient = (await createClient({
      url: process.env.REDIS_URL,
    }).connect()) as RedisClientType;

    return redisClient;
  } catch (error) {
    console.log('Error @ getRedisClient: ', error);

    return null;
  }
}

/**
 ** SET REDIS DATA
 * @param key - string
 * @param value - string
 */
export async function setRedisData(key: string, value: string): Promise<void> {
  try {
    const redisClient: RedisClientType | null = await getRedisClient();
    if (!redisClient) {
      throw new Error('Redis client not found @ setRedisData!');
    }

    await redisClient.set(key, value);
  } catch (error) {
    console.log('Error @ setRedisData: ', error);
  }
}

/**
 ** GET REDIS DATA
 * @param key - string
 * @returns string | null
 */
export async function getRedisData(key: string): Promise<string | null | {}> {
  try {
    const redisClient: RedisClientType | null = await getRedisClient();
    if (!redisClient) {
      throw new Error('Redis client not found @ getRedisData!');
    }

    const data = await redisClient.get(key);
    return data;
  } catch (error) {
    console.log('Error @ getRedisData: ', error);
    return null;
  }
}
