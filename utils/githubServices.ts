import crypto from 'crypto';
import { NextRequest } from 'next/server';

/**
 ** VALIDATE GITHUB SIGNATURE
 * @param request - NextRequest
 * @param signature - string
 * @returns boolean
 */
export function validateSignature(
  request: NextRequest,
  signature: string
): boolean {
  try {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!secret) {
      throw new Error('SECRET is not set');
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest =
      'sha256=' + hmac.update(JSON.stringify(request.body)).digest('hex');

    console.log('+--------------validateSignature--------------+');
    console.log('sig: ', signature);
    console.log(
      'sig validation: ',
      crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
    );
    console.log('+----------------------------------------------+');

    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch (error) {
    console.error('Error @ validateSignature: ', error);
    return false;
  }
}
