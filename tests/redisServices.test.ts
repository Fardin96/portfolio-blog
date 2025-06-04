import { jest } from '@jest/globals';
import { createClient } from 'redis';
import { clearRedis, resetRedisClient } from '../utils/redisServices';

jest.mock('redis', () => ({
  createClient: jest.fn(),
}));

const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

beforeEach(() => {
  let mockRedisClient: any;

  jest.clearAllMocks();

  mockRedisClient = {
    isReady: true,
    connect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
  };

  mockRedisClient.connect.mockResolvedValue(mockRedisClient);

  (createClient as jest.Mock).mockReturnValue(mockRedisClient);

  resetRedisClient();
});
