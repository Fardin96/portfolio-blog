import { jest } from '@jest/globals';
import crypto from 'crypto';

// Mock crypto module
jest.mock('crypto');

const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock environment variables BEFORE importing the module
const originalEnv = process.env;
process.env.GITHUB_WEBHOOK_SECRET = 'test-secret-key';

// Import AFTER setting environment variables
import { NextRequest } from 'next/server';
import {
  generateHmacHexSignature,
  validateGithubSignature,
  validateSignature,
} from '../utils/authServices';

describe('Auth Services - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();

    // Ensure environment variable is still set
    process.env.GITHUB_WEBHOOK_SECRET = 'test-secret-key';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('generateHmacHexSignature', () => {
    let mockHmac: any;

    beforeEach(() => {
      mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('mocked-signature-hex'),
      };

      (crypto.createHmac as jest.Mock).mockReturnValue(mockHmac);
    });

    it('should generate HMAC signature with default parameters', () => {
      const data = 'test-data';

      const result = generateHmacHexSignature(data);

      expect(crypto.createHmac).toHaveBeenCalledWith(
        'sha256',
        'test-secret-key'
      );
      expect(mockHmac.update).toHaveBeenCalledWith(data);
      expect(mockHmac.digest).toHaveBeenCalledWith('hex');
      expect(result).toBe('mocked-signature-hex');
    });

    it('should generate HMAC signature with custom algorithm', () => {
      const data = 'test-data';
      const algorithm = 'sha1';

      const result = generateHmacHexSignature(data, algorithm);

      expect(crypto.createHmac).toHaveBeenCalledWith('sha1', 'test-secret-key');
      expect(result).toBe('mocked-signature-hex');
    });

    it('should generate HMAC signature with custom key', () => {
      const data = 'test-data';
      const customKey = 'custom-secret';

      const result = generateHmacHexSignature(data, undefined, customKey);

      expect(crypto.createHmac).toHaveBeenCalledWith('sha256', 'custom-secret');
      expect(result).toBe('mocked-signature-hex');
    });

    it('should generate HMAC signature with both custom algorithm and key', () => {
      const data = 'test-data';
      const algorithm = 'sha512';
      const customKey = 'custom-secret';

      const result = generateHmacHexSignature(data, algorithm, customKey);

      expect(crypto.createHmac).toHaveBeenCalledWith('sha512', 'custom-secret');
      expect(result).toBe('mocked-signature-hex');
    });

    it('should handle crypto errors', () => {
      const data = 'test-data';
      (crypto.createHmac as jest.Mock).mockImplementation(() => {
        throw new Error('Crypto error');
      });

      expect(() => generateHmacHexSignature(data)).toThrow('Crypto error');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error @ generateHmacHexSignature: ',
        expect.any(Error)
      );
    });

    it('should handle empty data string', () => {
      const data = '';

      const result = generateHmacHexSignature(data);

      expect(mockHmac.update).toHaveBeenCalledWith('');
      expect(result).toBe('mocked-signature-hex');
    });

    it('should handle special characters in data', () => {
      const data = '{"test": "data with 特殊字符 & symbols!@#$%"}';

      const result = generateHmacHexSignature(data);

      expect(mockHmac.update).toHaveBeenCalledWith(data);
      expect(result).toBe('mocked-signature-hex');
    });
  });

  describe('validateGithubSignature', () => {
    let mockTimingSafeEqual: jest.Mock;
    let mockHmac: any;

    beforeEach(() => {
      mockTimingSafeEqual = jest.fn();
      (crypto.timingSafeEqual as jest.Mock) = mockTimingSafeEqual;

      // Mock crypto.createHmac for generateHmacHexSignature
      mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('expected-signature'),
      };
      (crypto.createHmac as jest.Mock).mockReturnValue(mockHmac);
    });

    it('should validate correct GitHub signature', () => {
      const bodyString = 'test-body';
      const signatureHeader = 'sha256=expected-signature';
      mockTimingSafeEqual.mockReturnValue(true);

      const result = validateGithubSignature(bodyString, signatureHeader);

      expect(result).toBe(true);
      expect(mockTimingSafeEqual).toHaveBeenCalledWith(
        Buffer.from('expected-signature', 'utf-8'),
        Buffer.from('expected-signature', 'utf-8')
      );
    });

    it('should reject incorrect GitHub signature', () => {
      const bodyString = 'test-body';
      const signatureHeader = 'sha256=wrong-signature';
      mockTimingSafeEqual.mockReturnValue(false);

      const result = validateGithubSignature(bodyString, signatureHeader);

      expect(result).toBe(false);
      expect(mockTimingSafeEqual).toHaveBeenCalledWith(
        Buffer.from('wrong-signature', 'utf-8'),
        Buffer.from('expected-signature', 'utf-8')
      );
    });

    it('should throw error for invalid algorithm', () => {
      const bodyString = 'test-body';
      const signatureHeader = 'sha1=signature'; // Invalid algorithm

      expect(() =>
        validateGithubSignature(bodyString, signatureHeader)
      ).toThrow('Unknown request');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error @ validateSignature: ',
        expect.any(Error)
      );
    });

    it('should throw error for malformed signature header', () => {
      const bodyString = 'test-body';
      const signatureHeader = 'malformed-header'; // No = sign

      expect(() =>
        validateGithubSignature(bodyString, signatureHeader)
      ).toThrow();
    });

    it('should handle empty signature header', () => {
      const bodyString = 'test-body';
      const signatureHeader = '';

      expect(() =>
        validateGithubSignature(bodyString, signatureHeader)
      ).toThrow();
    });

    it('should handle signature generation errors', () => {
      const bodyString = 'test-body';
      const signatureHeader = 'sha256=signature';

      (crypto.createHmac as jest.Mock).mockImplementation(() => {
        throw new Error('Signature generation failed');
      });

      expect(() =>
        validateGithubSignature(bodyString, signatureHeader)
      ).toThrow('Signature generation failed');
    });

    it('should handle timing safe equal errors', () => {
      const bodyString = 'test-body';
      const signatureHeader = 'sha256=signature';
      mockTimingSafeEqual.mockImplementation(() => {
        throw new Error('Buffer comparison failed');
      });

      expect(() =>
        validateGithubSignature(bodyString, signatureHeader)
      ).toThrow('Buffer comparison failed');
    });

    it('should validate with different body content', () => {
      const bodyString = '{"commits": [{"id": "123", "message": "test"}]}';
      const signatureHeader = 'sha256=expected-signature';
      mockTimingSafeEqual.mockReturnValue(true);

      const result = validateGithubSignature(bodyString, signatureHeader);

      expect(result).toBe(true);
    });
  });

  describe('validateSignature', () => {
    let mockRequest: NextRequest;
    let mockTimingSafeEqual: jest.Mock;
    let mockHmac: any;

    beforeEach(() => {
      mockTimingSafeEqual = jest.fn();
      (crypto.timingSafeEqual as jest.Mock) = mockTimingSafeEqual;

      mockRequest = {
        headers: {
          get: jest.fn(),
        },
        url: 'https://example.com/webhook?param1=value1&param2=value2',
      } as any;

      // Mock crypto.createHmac for generateHmacHexSignature
      mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('expected-signature'),
      };
      (crypto.createHmac as jest.Mock).mockReturnValue(mockHmac);
    });

    it('should validate correct custom signature', () => {
      (mockRequest.headers.get as jest.Mock)
        .mockReturnValueOnce('test-signature')
        .mockReturnValueOnce('1234567890');
      mockTimingSafeEqual.mockReturnValue(true);

      const result = validateSignature(mockRequest);

      expect(result).toBe(true);
      expect(mockRequest.headers.get).toHaveBeenCalledWith('X-Signature');
      expect(mockRequest.headers.get).toHaveBeenCalledWith('X-Timestamp');
    });

    it('should reject when signature header is missing', () => {
      (mockRequest.headers.get as jest.Mock)
        .mockReturnValueOnce(null) // No signature
        .mockReturnValueOnce('1234567890');

      const result = validateSignature(mockRequest);

      expect(result).toBe(false);
    });

    it('should reject when timestamp header is missing', () => {
      (mockRequest.headers.get as jest.Mock)
        .mockReturnValueOnce('test-signature')
        .mockReturnValueOnce(null); // No timestamp

      const result = validateSignature(mockRequest);

      expect(result).toBe(false);
    });

    it('should reject when both headers are missing', () => {
      (mockRequest.headers.get as jest.Mock).mockReturnValue(null);

      const result = validateSignature(mockRequest);

      expect(result).toBe(false);
    });

    it('should extract path correctly from URL', () => {
      (mockRequest.headers.get as jest.Mock)
        .mockReturnValueOnce('test-signature')
        .mockReturnValueOnce('1234567890');
      mockTimingSafeEqual.mockReturnValue(true);

      validateSignature(mockRequest);

      expect(crypto.createHmac).toHaveBeenCalledWith(
        'sha256',
        'test-secret-key'
      );
      expect(mockHmac.update).toHaveBeenCalledWith(
        'param1=value1&param2=value21234567890'
      );
    });

    it('should handle URL without query parameters', () => {
      (mockRequest as any).url = 'https://example.com/webhook';
      (mockRequest.headers.get as jest.Mock)
        .mockReturnValueOnce('test-signature')
        .mockReturnValueOnce('1234567890');
      mockTimingSafeEqual.mockReturnValue(true);

      validateSignature(mockRequest);

      expect(mockHmac.update).toHaveBeenCalledWith('undefined1234567890');
    });

    it('should handle signature generation errors', () => {
      (mockRequest.headers.get as jest.Mock)
        .mockReturnValueOnce('test-signature')
        .mockReturnValueOnce('1234567890');

      (crypto.createHmac as jest.Mock).mockImplementation(() => {
        throw new Error('Signature generation failed');
      });

      expect(() => validateSignature(mockRequest)).toThrow(
        'Signature generation failed'
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error @ validateSignature: ',
        expect.any(Error)
      );
    });

    it('should handle timing safe comparison errors', () => {
      (mockRequest.headers.get as jest.Mock)
        .mockReturnValueOnce('test-signature')
        .mockReturnValueOnce('1234567890');
      mockTimingSafeEqual.mockImplementation(() => {
        throw new Error('Comparison failed');
      });

      expect(() => validateSignature(mockRequest)).toThrow('Comparison failed');
    });

    it('should reject incorrect signature', () => {
      (mockRequest.headers.get as jest.Mock)
        .mockReturnValueOnce('wrong-signature')
        .mockReturnValueOnce('1234567890');
      mockTimingSafeEqual.mockReturnValue(false);

      const result = validateSignature(mockRequest);

      expect(result).toBe(false);
    });

    it('should handle empty string headers', () => {
      (mockRequest.headers.get as jest.Mock)
        .mockReturnValueOnce('') // Empty signature
        .mockReturnValueOnce('1234567890');

      const result = validateSignature(mockRequest);

      expect(result).toBe(false);
    });

    it('should handle special characters in timestamp', () => {
      (mockRequest.headers.get as jest.Mock)
        .mockReturnValueOnce('test-signature')
        .mockReturnValueOnce('1640995200.123'); // Timestamp with decimal
      mockTimingSafeEqual.mockReturnValue(true);

      const result = validateSignature(mockRequest);

      expect(result).toBe(true);
    });
  });
});
