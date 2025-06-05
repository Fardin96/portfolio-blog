import { jest } from '@jest/globals';
import { createClient } from 'redis';
import {
  getRedisClient,
  resetRedisClient,
  clearRedis,
  getRedisData,
  setRedisData,
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

describe('getRedisData', () => {
  beforeEach(() => {
    mockRedisClient.get.mockResolvedValue('test data');
  });

  it('should retrive data successfully', async () => {
    const data = await getRedisData('test-key');

    expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
    expect(data).toBe('test data');
  });

  it('should return null key does not exist', async () => {
    mockRedisClient.get.mockResolvedValue(null);

    const data = await getRedisData('nonExistantKey');

    expect(data).toBeNull();
  });

  it('should handle errors gracefully', async () => {
    mockRedisClient.get.mockRejectedValue(new Error('Redis Error!'));

    const data = await getRedisData('test-key');

    expect(data).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error @ getRedisData: ',
      expect.any(Error)
    );
  });
});

describe('setRedisData', () => {
  it('should create new data when key does not exist', async () => {
    mockRedisClient.get.mockResolvedValue(null);

    await setRedisData('new-key', 'new-value');

    expect(mockRedisClient.set).toHaveBeenCalledWith(
      'new-key',
      JSON.stringify(['new-value'])
    );
  });

  it('should append to existing data', async () => {
    mockRedisClient.get.mockResolvedValue(JSON.stringify(['existing-value']));

    await setRedisData('existing-key', 'new-value');

    expect(mockRedisClient.set).toHaveBeenCalledWith(
      'existing-key',
      JSON.stringify(['existing-value', 'new-value'])
    );
  });

  it('should handle empty object as no existing data', async () => {
    mockRedisClient.get.mockResolvedValue('{}');

    await setRedisData('key', 'value');

    expect(mockRedisClient.set).toHaveBeenCalledWith(
      'key',
      JSON.stringify(['value'])
    );
  });

  it('should handle errors gracefully', async () => {
    mockRedisClient.set.mockRejectedValue(new Error('Redis Error!'));

    await setRedisData('test-key', 'test-value');

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error @ setRedisData: ',
      expect.any(Error)
    );
  });
});
