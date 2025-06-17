import { jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { POST } from '../app/api/webhook/route';
import * as requestValidation from '../utils/requestValidation';
import * as redisServices from '../utils/redisServices';
import * as authServices from '../utils/authServices';

// Mock all utility modules
jest.mock('../utils/requestValidation');
jest.mock('../utils/redisServices');
jest.mock('../utils/authServices');

const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock NextRequest helper
function createMockRequest(
  body: any,
  headers: Record<string, string> = {}
): NextRequest {
  return {
    headers: {
      get: jest.fn((key: string) => headers[key] || null),
    },
    clone: jest.fn().mockReturnThis(),
    text: jest.fn().mockResolvedValue(JSON.stringify(body) as never),
    json: jest.fn().mockResolvedValue(body as never),
  } as any;
}

describe('POST /webhook Route - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
  });

  describe('Request Body Validation', () => {
    it('should return unauthorized when body is empty', async () => {
      const mockRequest = createMockRequest({});

      // Mock empty body response
      (requestValidation.getRequestBody as jest.Mock).mockResolvedValue(
        null as never
      );
      (requestValidation.unauthorizedResponse as jest.Mock).mockReturnValue(
        NextResponse.json(
          { success: false, message: 'Unauthorized!' },
          { status: 401 }
        )
      );

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData).toEqual({
        success: false,
        message: 'Unauthorized!',
      });
    });

    it('should return unauthorized when body parsing fails', async () => {
      const mockRequest = createMockRequest({});

      (requestValidation.getRequestBody as jest.Mock).mockResolvedValue(
        'invalid-json' as never
      );
      (requestValidation.parseRequestBody as jest.Mock).mockResolvedValue(
        undefined as never
      );
      (requestValidation.unauthorizedResponse as jest.Mock).mockReturnValue(
        NextResponse.json(
          { success: false, message: 'Unauthorized!' },
          { status: 401 }
        )
      );

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
    });

    it('should return unauthorized when parseRequestBody returns undefined', async () => {
      const mockRequest = createMockRequest({ invalid: 'data' });

      (requestValidation.getRequestBody as jest.Mock).mockResolvedValue(
        'valid-body' as never
      );
      (requestValidation.parseRequestBody as jest.Mock).mockResolvedValue(
        undefined as never
      );
      (requestValidation.unauthorizedResponse as jest.Mock).mockReturnValue(
        NextResponse.json(
          { success: false, message: 'Unauthorized!' },
          { status: 401 }
        )
      );

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
    });
  });

  describe('Signature Validation', () => {
    it('should return unauthorized when signature is invalid', async () => {
      const mockRequest = createMockRequest(
        { commits: [], head_commit: null },
        { 'X-Hub-Signature-256': 'invalid-signature' }
      );

      (requestValidation.getRequestBody as jest.Mock).mockResolvedValue(
        'valid-body' as never
      );
      (requestValidation.parseRequestBody as jest.Mock).mockResolvedValue({
        commits: [],
      } as never);
      (requestValidation.isSignatureValid as jest.Mock).mockReturnValue(false);
      (requestValidation.isBodyPopulated as jest.Mock).mockReturnValue(true);
      (requestValidation.unauthorizedResponse as jest.Mock).mockReturnValue(
        NextResponse.json(
          { success: false, message: 'Unauthorized!' },
          { status: 401 }
        )
      );

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
    });

    it('should validate signature correctly', async () => {
      const mockRequest = createMockRequest(
        { commits: [], head_commit: null },
        {
          'X-Hub-Signature-256': 'valid-signature',
          'x-github-event': 'push',
        }
      );

      (requestValidation.getRequestBody as jest.Mock).mockResolvedValue(
        'valid-body' as never
      );
      (requestValidation.parseRequestBody as jest.Mock).mockResolvedValue({
        commits: [],
      } as never);
      (requestValidation.isSignatureValid as jest.Mock).mockReturnValue(true);
      (requestValidation.isBodyPopulated as jest.Mock).mockReturnValue(true);
      (requestValidation.createWebhookData as jest.Mock).mockReturnValue({
        timestamp: '2024-01-01T00:00:00.000Z',
        eventType: 'push',
        payload: { commits: [], head_commit: null },
      });
      (requestValidation.successResponse as jest.Mock).mockReturnValue(
        NextResponse.json({
          success: true,
          message: 'Github webhook received!',
        })
      );
      (redisServices.setRedisData as jest.Mock).mockResolvedValue(
        undefined as never
      );

      const response = await POST(mockRequest);

      expect(requestValidation.isSignatureValid).toHaveBeenCalledWith(
        'valid-signature',
        'valid-body'
      );
    });
  });

  describe('Body Population Validation', () => {
    it('should return unauthorized when body is not populated', async () => {
      const mockRequest = createMockRequest({});

      (requestValidation.getRequestBody as jest.Mock).mockResolvedValue(
        '{}' as never
      );
      (requestValidation.parseRequestBody as jest.Mock).mockResolvedValue(
        {} as never
      );
      (requestValidation.isSignatureValid as jest.Mock).mockReturnValue(true);
      (requestValidation.isBodyPopulated as jest.Mock).mockReturnValue(false);
      (requestValidation.unauthorizedResponse as jest.Mock).mockReturnValue(
        NextResponse.json(
          { success: false, message: 'Unauthorized!' },
          { status: 401 }
        )
      );

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
    });

    it('should validate body population correctly', async () => {
      const validBody = {
        commits: [{ id: '123' }],
        head_commit: { id: '123' },
      };
      const mockRequest = createMockRequest(validBody, {
        'X-Hub-Signature-256': 'valid-signature',
        'x-github-event': 'push',
      });

      (requestValidation.getRequestBody as jest.Mock).mockResolvedValue(
        JSON.stringify(validBody) as never
      );
      (requestValidation.parseRequestBody as jest.Mock).mockResolvedValue(
        validBody as never
      );
      (requestValidation.isSignatureValid as jest.Mock).mockReturnValue(true);
      (requestValidation.isBodyPopulated as jest.Mock).mockReturnValue(true);
      (requestValidation.createWebhookData as jest.Mock).mockReturnValue({
        timestamp: '2024-01-01T00:00:00.000Z',
        eventType: 'push',
        payload: validBody,
      });
      (requestValidation.successResponse as jest.Mock).mockReturnValue(
        NextResponse.json({
          success: true,
          message: 'Github webhook received!',
        })
      );
      (redisServices.setRedisData as jest.Mock).mockResolvedValue(
        undefined as never
      );

      await POST(mockRequest);

      expect(requestValidation.isBodyPopulated).toHaveBeenCalledWith(validBody);
    });
  });

  describe('Event Type Handling', () => {
    it('should handle ping events correctly', async () => {
      const mockRequest = createMockRequest(
        { zen: 'test' },
        {
          'X-Hub-Signature-256': 'valid-signature',
          'x-github-event': 'ping',
        }
      );

      (requestValidation.getRequestBody as jest.Mock).mockResolvedValue(
        'valid-body' as never
      );
      (requestValidation.parseRequestBody as jest.Mock).mockResolvedValue({
        zen: 'test',
      } as never);
      (requestValidation.isSignatureValid as jest.Mock).mockReturnValue(true);
      (requestValidation.isBodyPopulated as jest.Mock).mockReturnValue(true);

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.message).toBe('Pong!');
      expect(redisServices.setRedisData).not.toHaveBeenCalled();
    });

    it('should return unauthorized for unknown event types', async () => {
      const mockRequest = createMockRequest(
        { commits: [] },
        {
          'X-Hub-Signature-256': 'valid-signature',
          // No x-github-event header, defaults to 'unknown'
        }
      );

      (requestValidation.getRequestBody as jest.Mock).mockResolvedValue(
        'valid-body' as never
      );
      (requestValidation.parseRequestBody as jest.Mock).mockResolvedValue({
        commits: [],
      } as never);
      (requestValidation.isSignatureValid as jest.Mock).mockReturnValue(true);
      (requestValidation.isBodyPopulated as jest.Mock).mockReturnValue(true);
      (requestValidation.unauthorizedResponse as jest.Mock).mockReturnValue(
        NextResponse.json(
          { success: false, message: 'Unauthorized!' },
          { status: 401 }
        )
      );

      const response = await POST(mockRequest);

      expect(requestValidation.unauthorizedResponse).toHaveBeenCalled();
    });

    it('should process valid push events', async () => {
      const validBody = {
        commits: [{ id: '123', message: 'test commit' }],
        head_commit: { id: '123', message: 'test commit' },
      };
      const mockRequest = createMockRequest(validBody, {
        'X-Hub-Signature-256': 'valid-signature',
        'x-github-event': 'push',
      });

      (requestValidation.getRequestBody as jest.Mock).mockResolvedValue(
        JSON.stringify(validBody) as never
      );
      (requestValidation.parseRequestBody as jest.Mock).mockResolvedValue(
        validBody as never
      );
      (requestValidation.isSignatureValid as jest.Mock).mockReturnValue(true);
      (requestValidation.isBodyPopulated as jest.Mock).mockReturnValue(true);
      (requestValidation.createWebhookData as jest.Mock).mockReturnValue({
        timestamp: '2024-01-01T00:00:00.000Z',
        eventType: 'push',
        payload: validBody,
      });
      (requestValidation.successResponse as jest.Mock).mockReturnValue(
        NextResponse.json({
          success: true,
          message: 'Github webhook received!',
        })
      );
      (redisServices.setRedisData as jest.Mock).mockResolvedValue(
        undefined as never
      );

      await POST(mockRequest);

      expect(requestValidation.createWebhookData).toHaveBeenCalledWith(
        validBody,
        'push'
      );
      expect(redisServices.setRedisData).toHaveBeenCalledWith(
        'webhookData',
        JSON.stringify({
          timestamp: '2024-01-01T00:00:00.000Z',
          eventType: 'push',
          payload: validBody,
        })
      );
    });
  });

  describe('Redis Integration', () => {
    it('should store webhook data in Redis after successful validation', async () => {
      const validBody = { commits: [], head_commit: null };
      const webhookData = {
        timestamp: '2024-01-01T00:00:00.000Z',
        eventType: 'push',
        payload: validBody,
      };
      const mockRequest = createMockRequest(validBody, {
        'X-Hub-Signature-256': 'valid-signature',
        'x-github-event': 'push',
      });

      (requestValidation.getRequestBody as jest.Mock).mockResolvedValue(
        JSON.stringify(validBody) as never
      );
      (requestValidation.parseRequestBody as jest.Mock).mockResolvedValue(
        validBody as never
      );
      (requestValidation.isSignatureValid as jest.Mock).mockReturnValue(true);
      (requestValidation.isBodyPopulated as jest.Mock).mockReturnValue(true);
      (requestValidation.createWebhookData as jest.Mock).mockReturnValue(
        webhookData
      );
      (requestValidation.successResponse as jest.Mock).mockReturnValue(
        NextResponse.json({
          success: true,
          message: 'Github webhook received!',
        })
      );
      (redisServices.setRedisData as jest.Mock).mockResolvedValue(
        undefined as never
      );

      await POST(mockRequest);

      expect(redisServices.setRedisData).toHaveBeenCalledWith(
        'webhookData',
        JSON.stringify(webhookData)
      );
    });

    it('should handle Redis errors gracefully', async () => {
      const mockRequest = createMockRequest(
        { commits: [] },
        {
          'X-Hub-Signature-256': 'valid-signature',
          'x-github-event': 'push',
        }
      );

      (requestValidation.getRequestBody as jest.Mock).mockResolvedValue(
        'valid-body' as never
      );
      (requestValidation.parseRequestBody as jest.Mock).mockResolvedValue({
        commits: [],
      } as never);
      (requestValidation.isSignatureValid as jest.Mock).mockReturnValue(true);
      (requestValidation.isBodyPopulated as jest.Mock).mockReturnValue(true);
      (requestValidation.createWebhookData as jest.Mock).mockReturnValue({
        timestamp: '2024-01-01T00:00:00.000Z',
        eventType: 'push',
        payload: { commits: [] },
      });
      (redisServices.setRedisData as jest.Mock).mockRejectedValue(
        new Error('Redis connection failed') as never
      );

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Webhook POST error!');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error @ webhook-POST: ',
        expect.any(Error)
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      const mockRequest = createMockRequest({});

      (requestValidation.getRequestBody as jest.Mock).mockRejectedValue(
        new Error('Unexpected error') as never
      );

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Webhook POST error!');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error @ webhook-POST: ',
        expect.any(Error)
      );
    });

    it('should handle missing signature header', async () => {
      const mockRequest = createMockRequest({ commits: [] });

      (requestValidation.getRequestBody as jest.Mock).mockResolvedValue(
        'valid-body' as never
      );
      (requestValidation.parseRequestBody as jest.Mock).mockResolvedValue({
        commits: [],
      } as never);
      (requestValidation.isSignatureValid as jest.Mock).mockReturnValue(false);
      (requestValidation.isBodyPopulated as jest.Mock).mockReturnValue(true);

      const response = await POST(mockRequest);

      expect(response.status).toBe(401);
    });
  });

  describe('Combined Validation Flow', () => {
    it('should pass all validations for a complete valid request', async () => {
      const validBody = {
        commits: [{ id: '123', message: 'test' }],
        head_commit: { id: '123', message: 'test' },
        repository: { name: 'test-repo' },
      };
      const mockRequest = createMockRequest(validBody, {
        'X-Hub-Signature-256': 'sha256=valid-signature',
        'x-github-event': 'push',
      });

      // Mock all validation functions to return true/valid
      (requestValidation.getRequestBody as jest.Mock).mockResolvedValue(
        JSON.stringify(validBody) as never
      );
      (requestValidation.parseRequestBody as jest.Mock).mockResolvedValue(
        validBody as never
      );
      (requestValidation.isSignatureValid as jest.Mock).mockReturnValue(true);
      (requestValidation.isBodyPopulated as jest.Mock).mockReturnValue(true);
      (requestValidation.createWebhookData as jest.Mock).mockReturnValue({
        timestamp: '2024-01-01T00:00:00.000Z',
        eventType: 'push',
        payload: {
          commits: validBody.commits,
          head_commit: validBody.head_commit,
        },
      });
      (requestValidation.successResponse as jest.Mock).mockReturnValue(
        NextResponse.json({
          success: true,
          message: 'Github webhook received!',
        })
      );
      (redisServices.setRedisData as jest.Mock).mockResolvedValue(
        undefined as never
      );

      const response = await POST(mockRequest);

      // Verify all validation functions were called
      expect(requestValidation.getRequestBody).toHaveBeenCalledWith(
        mockRequest
      );
      expect(requestValidation.parseRequestBody).toHaveBeenCalledWith(
        mockRequest
      );
      expect(requestValidation.isSignatureValid).toHaveBeenCalledWith(
        'sha256=valid-signature',
        JSON.stringify(validBody)
      );
      expect(requestValidation.isBodyPopulated).toHaveBeenCalledWith(validBody);
      expect(requestValidation.createWebhookData).toHaveBeenCalledWith(
        validBody,
        'push'
      );
      expect(redisServices.setRedisData).toHaveBeenCalled();
      expect(requestValidation.successResponse).toHaveBeenCalled();
    });
  });
});
