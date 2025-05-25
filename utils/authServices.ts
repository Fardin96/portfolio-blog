import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { GitHookPayload } from '../public/types/webhookTypes';

const secret = process.env.GITHUB_WEBHOOK_SECRET;

/**
 ** CREATE HMAC-HEX SIGNATURE
 * @param path - string
 * @param timestamp - string
 * @returns string
 */
export function generateHmacHexSignature(
  data: string,
  algorithm?: string,
  key?: string
): string {
  try {
    // default values
    algorithm = algorithm || 'sha256';
    key = key || secret;

    // validate webhook secret
    if (!key) {
      throw new Error('Unknown Error');
    }

    const hmac = crypto.createHmac(algorithm, key); // hash function
    const signature = hmac.update(data).digest('hex'); // generate signature

    return signature;
  } catch (error) {
    console.error('Error @ generateHmacHexSignature: ', error);
    throw error;
  }
}

/**
 ** TIMING SAFE SIGNATRUE VALIDATION (HMAC-HEX)
 * @param signature - string
 * @param expectedSignature - string
 * @returns boolean
 */
function isValidSignature(
  signature: string,
  expectedSignature: string
): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'utf-8'),
    Buffer.from(expectedSignature, 'utf-8')
  );
}

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
    // validate signature algorithm
    const [algorithm, signature] = signatureHeader.split('=');
    if (algorithm !== 'sha256') {
      throw new Error('Unknown request');
    }

    const expectedSignature = generateHmacHexSignature(JSON.stringify(body));

    return isValidSignature(signature, expectedSignature);
  } catch (error) {
    console.error('Error @ validateSignature: ', error);
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

    const expectedSignature = generateHmacHexSignature(data);

    return isValidSignature(signature, expectedSignature);
  } catch (error) {
    console.error('Error @ validateSignature: ', error);
    throw error;
  }
}
