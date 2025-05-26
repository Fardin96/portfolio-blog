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

    return redisClient;
  } catch (error) {
    console.log('Error @ getRedisClient: ', error);

    return null;
  }
}

async function ensureRedisClient(): Promise<void> {
  const redis: RedisClientType | null = await getRedisClient();

  if (!redis) {
    throw new Error('Redis client not found @ ensureRedisClient!');
  }
}

/**
 ** SET REDIS DATA
 * @param key - string
 * @param value - string
 */
export async function setRedisData(key: string, value: string): Promise<void> {
  try {
    await ensureRedisClient();

    const existing = await getRedisData(key);
    let formattedValue: string[] = [];

    if (!existing || Object.keys(existing).length === 0) {
      formattedValue.push(value);
      await redisClient.set(key, JSON.stringify(formattedValue));
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
    await ensureRedisClient();

    const data = await redisClient.get(key);
    return data;
  } catch (error) {
    console.log('Error @ getRedisData: ', error);
    return null;
  }
}
