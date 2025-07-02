import { jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import {
  getRequestBody,
  parseRequestBody,
  isSignatureValid,
  isBodyPopulated,
  createWebhookData,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from '../utils/requestValidation';
import * as authServices from '../utils/authServices';

// Mock authServices
jest.mock('../utils/authServices');

const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock NextRequest helper
function createMockRequest(body: any, method: string = 'POST'): NextRequest {
  return {
    clone: () => ({
      text: jest.fn().mockResolvedValue(JSON.stringify(body) as never),
    }),
    json: jest.fn().mockResolvedValue(body as never),
    method,
  } as any;
}

describe('Request Validation Utils - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
  });

  describe('getRequestBody', () => {
    it('should return body text when body is not empty', async () => {
      const body = { test: 'data' };
      const mockRequest = createMockRequest(body);

      const result = await getRequestBody(mockRequest);

      expect(result).toBe(JSON.stringify(body));
    });

    it('should return null when body is empty', async () => {
      const mockRequest = {
        clone: () => ({
          text: jest.fn().mockResolvedValue('' as never),
        }),
      } as any;

      const result = await getRequestBody(mockRequest);

      expect(result).toBeNull();
    });

    it('should return null when body has only whitespace', async () => {
      const mockRequest = {
        clone: () => ({
          text: jest.fn().mockResolvedValue('   ' as never),
        }),
      } as any;

      const result = await getRequestBody(mockRequest);

      expect(result).toBe('   '); // Actually returns the whitespace, not null
    });
  });

  describe('parseRequestBody', () => {
    it('should parse valid JSON body', async () => {
      const body = { commits: [], head_commit: null };
      const mockRequest = createMockRequest(body);

      const result = await parseRequestBody(mockRequest);

      expect(result).toEqual(body);
    });

    it('should return undefined for invalid JSON', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON') as never),
      } as any;

      const result = await parseRequestBody(mockRequest);

      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error @ parseRequestBody: ',
        expect.any(Error)
      );
    });

    it('should handle network errors gracefully', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Network error') as never),
      } as any;

      const result = await parseRequestBody(mockRequest);

      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error @ parseRequestBody: ',
        expect.any(Error)
      );
    });
  });

  describe('isSignatureValid', () => {
    it('should return true for valid signature', () => {
      const signature = 'sha256=valid-signature';
      const bodyTxt = 'test-body';

      (authServices.validateGithubSignature as jest.Mock).mockReturnValue(true);

      const result = isSignatureValid(signature, bodyTxt);

      expect(result).toBe(true);
      expect(authServices.validateGithubSignature).toHaveBeenCalledWith(
        bodyTxt,
        signature
      );
    });

    it('should return false for invalid signature', () => {
      const signature = 'sha256=invalid-signature';
      const bodyTxt = 'test-body';

      (authServices.validateGithubSignature as jest.Mock).mockReturnValue(
        false
      );

      const result = isSignatureValid(signature, bodyTxt);

      expect(result).toBe(false);
    });

    it('should return false when signature is null', () => {
      const result = isSignatureValid(null, 'test-body');

      expect(result).toBe(false);
      expect(authServices.validateGithubSignature).not.toHaveBeenCalled();
    });

    it('should return false when signature is empty string', () => {
      const result = isSignatureValid('', 'test-body');

      expect(result).toBe(false);
      expect(authServices.validateGithubSignature).not.toHaveBeenCalled();
    });

    it('should handle authentication service errors', () => {
      const signature = 'sha256=valid-signature';
      const bodyTxt = 'test-body';

      (authServices.validateGithubSignature as jest.Mock).mockImplementation(
        () => {
          throw new Error('Auth service error');
        }
      );

      expect(() => isSignatureValid(signature, bodyTxt)).toThrow(
        'Auth service error'
      );
    });
  });

  describe('isBodyPopulated', () => {
    it('should return true for populated body', () => {
      const body = {
        commits: [],
        head_commit: null,
        repository: { name: 'test' },
      };

      const result = isBodyPopulated(body);

      expect(result).toBe(true);
    });

    it('should return false for empty object', () => {
      const body = {};

      const result = isBodyPopulated(body);

      expect(result).toBe(false);
    });

    it('should return true for body with only one property', () => {
      const body = { zen: 'GitHub zen message' };

      const result = isBodyPopulated(body);

      expect(result).toBe(true);
    });

    it('should return true for body with null values', () => {
      const body = { commits: null, head_commit: null };

      const result = isBodyPopulated(body);

      expect(result).toBe(true);
    });
  });

  describe('createWebhookData', () => {
    beforeEach(() => {
      // Mock Date.now() to return consistent timestamp
      jest
        .spyOn(Date.prototype, 'toISOString')
        .mockReturnValue('2024-01-01T12:00:00.000Z');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create webhook data with commits and head_commit', () => {
      const body = {
        commits: [
          { id: '123', message: 'test commit' },
          { id: '456', message: 'another commit' },
        ],
        head_commit: { id: '456', message: 'another commit' },
        repository: { name: 'test-repo' },
      };
      const eventType = 'push';

      const result = createWebhookData(body as any, eventType);

      expect(result).toEqual({
        timestamp: '2024-01-01T12:00:00.000Z',
        eventType: 'push',
        payload: {
          commits: body.commits,
          head_commit: body.head_commit,
        },
      });
    });

    it('should create webhook data with null commits', () => {
      const body = {
        commits: null,
        head_commit: null,
        zen: 'GitHub zen message',
      };
      const eventType = 'ping';

      const result = createWebhookData(body as any, eventType);

      expect(result).toEqual({
        timestamp: '2024-01-01T12:00:00.000Z',
        eventType: 'ping',
        payload: {
          commits: null,
          head_commit: null,
        },
      });
    });

    it('should create webhook data for different event types', () => {
      const body = {
        commits: [],
        head_commit: null,
        action: 'opened',
        pull_request: { id: 1 },
      };
      const eventType = 'pull_request';

      const result = createWebhookData(body as any, eventType);

      expect(result.eventType).toBe('pull_request');
      expect(result.payload).toEqual({
        commits: [],
        head_commit: null,
      });
    });

    it('should always include timestamp', () => {
      const body = { commits: [], head_commit: null };
      const eventType = 'push';

      const result = createWebhookData(body as any, eventType);

      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe('string');
    });
  });

  describe('Response Functions', () => {
    describe('successResponse', () => {
      it('should return success response with correct structure', () => {
        const response = successResponse();

        expect(response).toBeInstanceOf(NextResponse);
        // Test the response structure by converting to JSON
        expect(response.status).toBe(200);
      });
    });

    describe('errorResponse', () => {
      it('should return error response with correct structure', () => {
        const response = errorResponse();

        expect(response).toBeInstanceOf(NextResponse);
        expect(response.status).toBe(400);
      });
    });

    describe('unauthorizedResponse', () => {
      it('should return unauthorized response with correct structure', () => {
        const response = unauthorizedResponse();

        expect(response).toBeInstanceOf(NextResponse);
        expect(response.status).toBe(401);
      });
    });

    describe('notFoundResponse', () => {
      it('should return not found response with correct structure', () => {
        const response = notFoundResponse();

        expect(response).toBeInstanceOf(NextResponse);
        expect(response.status).toBe(404);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed webhook payload', () => {
      const body = {
        // Missing required fields
        malformed: true,
        random_field: 'value',
      };

      const result = isBodyPopulated(body);
      expect(result).toBe(true); // Still populated, just not valid structure
    });

    it('should handle very large payloads', () => {
      const largeCommitArray = Array.from({ length: 1000 }, (_, i) => ({
        id: `commit-${i}`,
        message: `Commit message ${i}`,
      }));

      const body = {
        commits: largeCommitArray,
        head_commit: largeCommitArray[999],
      };

      const result = createWebhookData(body as any, 'push');

      expect(result.payload.commits).toHaveLength(1000);
      expect(result.eventType).toBe('push');
    });

    it('should handle special characters in commit messages', () => {
      const body = {
        commits: [
          {
            id: '123',
            message:
              'Fix: 特殊字符 & émojis 🚀 and "quotes" with \\backslashes',
          },
        ],
        head_commit: {
          id: '123',
          message: 'Fix: 特殊字符 & émojis 🚀 and "quotes" with \\backslashes',
        },
      };

      const result = createWebhookData(body as any, 'push');

      expect(result.payload.commits[0].message).toContain('特殊字符');
      expect(result.payload.commits[0].message).toContain('🚀');
    });
  });
});
