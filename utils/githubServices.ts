import crypto from 'crypto';
import { GitHookPayload } from '../public/types/webhookTypes';

/**
 ** VALIDATE GITHUB SIGNATURE
 * @param request - NextRequest
 * @param signatureHeader - string
 * @returns boolean
 */
export function validateSignature(
  body: GitHookPayload,
  signatureHeader: string
): boolean {
  try {
    // validate webhook secret
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('Unknown request');
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
