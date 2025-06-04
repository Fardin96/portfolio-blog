import { NextRequest, NextResponse } from 'next/server';
import {
  isSignatureValid,
  unauthorizedResponse,
  isBodyPopulated,
} from '../../../utils/requestValidation';
import { createWebhookData } from '../../../utils/requestValidation';
import {
  getRequestBody,
  parseRequestBody,
} from '../../../utils/requestValidation';
import { successResponse } from '../../../utils/requestValidation';
import { setRedisData } from '../../../utils/redisServices';

/**
 ** GITHUB WEBHOOK ENDPOINT
 * @param request - NextRequest
 * @returns NextResponse
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const signature = request.headers.get('X-Hub-Signature-256');
    const bodyTxt = await getRequestBody(request);

    // auth
    if (!bodyTxt) {
      return unauthorizedResponse();
    }

    const body = await parseRequestBody(request);
    const isRequestValid =
      body && isSignatureValid(signature, bodyTxt) && isBodyPopulated(body);

    if (!isRequestValid) {
      return unauthorizedResponse();
    }

    // handle eventType
    const eventType = request.headers.get('x-github-event') || 'unknown';
    if (eventType === 'ping') {
      return NextResponse.json({ message: 'Pong!' });
    } else if (eventType === 'unknown') {
      return unauthorizedResponse();
    }

    // format & set data to redis
    const webhookData = createWebhookData(body, eventType);
    await setRedisData('webhookData', JSON.stringify(webhookData));

    return successResponse();
  } catch (error) {
    console.error('Error @ webhook-POST: ', error);
    return NextResponse.json({ error: 'Webhook POST error!' }, { status: 400 });
  }
}
