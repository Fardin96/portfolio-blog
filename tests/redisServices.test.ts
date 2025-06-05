import { jest } from '@jest/globals';
import { createClient } from 'redis';
import {
  getRedisClient,
  resetRedisClient,
  clearRedis,
} from '../utils/redisServices';

jest.mock('redis', () => ({
  createClient: jest.fn(),
}));

const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
let mockRedisClient: any;

beforeEach(() => {
  jest.clearAllMocks();

  mockRedisClient = {
    isReady: true,
    connect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
    quit: jest.fn(),
  };

  mockRedisClient.connect.mockResolvedValue(mockRedisClient);

  (createClient as jest.Mock).mockReturnValue(mockRedisClient);

  resetRedisClient();
});

afterEach(() => {
  consoleSpy.mockClear();
});

describe('getRedisClient', () => {
  it('should return existing redis client if already connected', async () => {
    const firstClient = await getRedisClient();
    const secondClient = await getRedisClient();

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(firstClient).toBe(mockRedisClient);
    expect(secondClient).toBe(mockRedisClient);
    expect(firstClient).toBe(secondClient);
  });

  it('should create new client if none exists', async () => {
    const client = await getRedisClient();

    expect(createClient).toHaveBeenCalledWith({
      url: process.env.REDIS_URL,
    });
    expect(mockRedisClient.connect).toHaveBeenCalled();
    expect(client).toBe(mockRedisClient);
  });

  it('should handle errors gracefully', async () => {
    mockRedisClient.connect.mockRejectedValue(new Error('Connection failed'));

    const client = await getRedisClient();

    expect(client).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error @ getRedisClient: ',
      expect.any(Error)
    );
  });

  it('should create new client if existing is not ready', async () => {
    await getRedisClient();

    mockRedisClient.isReady = false;

    const client = await getRedisClient();

    expect(createClient).toHaveBeenCalledTimes(2);
    expect(client).toBe(mockRedisClient);
  });
});
