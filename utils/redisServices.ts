import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

/**
 ** GET REDIS CLIENT
 * @returns RedisClientType | null
 */
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

    if (!redisClient) {
      throw new Error('Redis client not found!');
    }

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
    const redis: RedisClientType | null = await getRedisClient();

    const existing: string | null | {} = await getRedisData(key);
    let formattedValue: string[] = [];

    if (!existing || Object.keys(existing).length === 0) {
      formattedValue.push(value);
      await redis.set(key, JSON.stringify(formattedValue));
      return;
    }

    if (Object.keys(existing).length > 0) {
      formattedValue = [existing as string, value];
    }
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
    const redis: RedisClientType | null = await getRedisClient();

    const data = await redis.get(key);
    return data;
  } catch (error) {
    console.log('Error @ getRedisData: ', error);
    return null;
  }
}
