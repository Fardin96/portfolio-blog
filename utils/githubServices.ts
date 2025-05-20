import crypto from 'crypto';
import { NextRequest } from 'next/server';

/**
 ** Get the body of the request as a string
 * @param request - NextRequest
 * @returns string
 */
async function getBodyString(request: NextRequest): Promise<string> {
  if (typeof request.body === 'string') {
    return request.body;
  }

  try {
    return request.text();
  } catch (error) {
    throw new Error('Unknown request');
  }
}

/**
 ** VALIDATE GITHUB SIGNATURE
 * @param request - NextRequest
 * @param signatureHeader - string
 * @returns boolean
 */
export async function validateSignature(
  request: NextRequest,
  signatureHeader: string
): Promise<boolean> {
  try {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!secret) {
      throw new Error('SECRET is not set');
    }

    const [algorithm, signature] = signatureHeader.split('=');

    if (algorithm !== 'sha256') {
      throw new Error('Invalid algorithm');
    }

    const bodyString: string = await getBodyString(request); // validate body data type

    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(bodyString).digest('hex');

    console.log('+--------------validateSignature--------------+');
    // console.log('request header: ', request.headers);
    // console.log('await request.text(): ', await request.text());
    console.log('body string: ', bodyString);
    console.log('+---------------------------------------------+');
    // console.log('signatureHeader: ', signatureHeader);
    console.log('signature: ', signature);
    console.log('expectedSignature: ', expectedSignature);
    console.log('+---------------------------------------------+');
    console.log(
      'sig validation: ',
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(signature, 'utf-8')
      )
    );
    console.log('+---------------------X------------------------+');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch (error) {
    console.error('Error @ validateSignature: ', error);
    return false;
  }
}
