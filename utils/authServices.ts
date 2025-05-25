import crypto from 'crypto';
import { GitHookPayload } from '../public/types/webhookTypes';
import { NextRequest } from 'next/server';

const secret = process.env.GITHUB_WEBHOOK_SECRET;

/**
 ** VALIDATE GITHUB SIGNATURE
 * @param request - NextRequest
 * @param signatureHeader - string
 * @returns boolean
 */
export function validateGithubSignature(
  body: GitHookPayload,
  signatureHeader: string
): boolean {
  try {
    // validate webhook secret
    if (!secret) {
      throw new Error('Unknown Error');
    }

    // validate signature algorithm
    const [algorithm, signature] = signatureHeader.split('=');
    if (algorithm !== 'sha256') {
      throw new Error('Unknown request');
    }

    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(JSON.stringify(body)).digest('hex');

    // return signature validation
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch (error) {
    console.error('Error @ validateSignature: ', error);
    return false;
  }
}

/**
 ** CREATE SIGNATURE
 * @param path - string
 * @param timestamp - string
 * @returns string
 */
export function generateSignature(path: string, timestamp: string): string {
  const data = `${path}${timestamp}`;

  const hmac = crypto.createHmac('sha256', secret);
  const signature = hmac.update(data).digest('hex');

  return signature;
}

/**
 ** VALIDATE SIGNATURE
 * @param request - NextRequest
 * @returns boolean
 */
export function validateSignature(request: NextRequest): boolean {
  const signature = request.headers.get('X-Signature');
  const timestamp = request.headers.get('X-Timestamp');

  if (!(signature && timestamp)) {
    return false;
  }

  const path = request.url.split('?')[1];
  const data = `${path}${timestamp}`;

  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = hmac.update(data).digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'utf-8'),
    Buffer.from(expectedSignature, 'utf-8')
  );
}
