import { NextRequest, NextResponse } from 'next/server';
import {
  isSignatureValid,
  isBodyPopulated,
} from '../../../utils/requestValidation';
import { createWebhookData } from '../../../utils/requestValidation';
import {
  getRequestBody,
  parseRequestBody,
} from '../../../utils/requestValidation';
import { errorResponse, successResponse } from '../../../utils/Response';
import { unauthorizedResponse } from '../../../utils/Response';
import { getRedisData, setRedisData } from '../../../utils/redisServices';
import { handleCacheRevalidation } from '../../../utils/hookHandlerServices';
import { WebhookData } from '../../../utils/types/webhookTypes';

/**
 ** GITHUB WEBHOOK HANDLER ENDPOINT
 * @param request - NextRequest
 * @returns NextResponse
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const signature = request.headers.get('X-Hub-Signature-256');
    const bodyTxt = await getRequestBody(request);

    // auth & validation
    if (!bodyTxt) {
      return unauthorizedResponse();
    }

    const body = await parseRequestBody(request);
    console.log('+-----------------PARSE-REQUEST-BODY-FUNCTION----------------+');
    console.log('body', body);
    console.log('+-----------------PARSE-REQUEST-BODY-FUNCTION----------------+');
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
    const webhookData = createWebhookData(body.head_commit);
    const existing = (await getRedisData('webhookData')) as string;
    const existingData: WebhookData[] = existing ? JSON.parse(existing) : [];
    const newData = existingData.unshift(webhookData);
    await setRedisData('webhookData', JSON.stringify(newData)); // todo: modify this to store the least amount of data

    // handle cache revalidation
    handleCacheRevalidation(body);

    return successResponse();
  } catch (error) {
    console.error('Error @ webhook-POST: ', error);
    return errorResponse('Webhook POST error!');
  }
}
