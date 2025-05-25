import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { GitHookPayload } from '../public/types/webhookTypes';

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
    throw error;
  }
}

/**
 ** CREATE SIGNATURE
 * @param path - string
 * @param timestamp - string
 * @returns string
 */
export function generateSignature(path: string, timestamp: string): string {
  try {
    const data = `${path}${timestamp}`; // required data format

    const hmac = crypto.createHmac('sha256', secret);
    const signature = hmac.update(data).digest('hex'); // generate signature

    return signature;
  } catch (error) {
    console.error('Error @ createSignature: ', error);
    throw error;
  }
}

/**
 ** VALIDATE SIGNATURE
 * @param request - NextRequest
 * @returns boolean
 */
export function validateSignature(request: NextRequest): boolean {
  try {
    const signature = request.headers.get('X-Signature');
    const timestamp = request.headers.get('X-Timestamp');

    // check if exists
    if (!(signature && timestamp)) {
      return false;
    }

    // extract and format required fields
    const path = request.url.split('?')[1];
    const data = `${path}${timestamp}`;

    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(data).digest('hex'); // create signature

    // return signature validation
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf-8'),
      Buffer.from(expectedSignature, 'utf-8')
    );
  } catch (error) {
    console.error('Error @ validateSignature: ', error);
    throw error;
  }
}
