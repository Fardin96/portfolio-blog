import { NextRequest, NextResponse } from 'next/server';
import {
  isSignatureValid,
  isBodyPopulated,
} from '../../../utils/requestValidation';
import {
  getRequestBody,
  parseRequestBody,
} from '../../../utils/requestValidation';
import { errorResponse, successResponse } from '../../../utils/Response';
import { unauthorizedResponse } from '../../../utils/Response';
import {
  handleCacheRevalidation,
  storeWebhookData,
} from '../../../utils/hookHandlerServices';

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

    // store webhook data in redis
    await storeWebhookData(body);

    // handle cache revalidation
    handleCacheRevalidation(body);

    return successResponse();
  } catch (error) {
    console.error('Error @ webhook-POST: ', error);
    return errorResponse('Webhook POST error!');
  }
}
