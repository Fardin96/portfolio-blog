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
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 ** GITHUB WEBHOOK HANDLER ENDPOINT
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
    await setRedisData('webhookData', JSON.stringify(webhookData)); // todo: modify this to store the least amount of data

    // get modified file paths
    const modifiedFiles: string[] = [
      ...body?.head_commit?.removed,
      ...body?.head_commit?.modified,
    ];

    // remove cache for specific posts only
    modifiedFiles.forEach((file) => {
      revalidateTag(`github-blog-post-${file}`);
    });

    // Only invalidate blog list if new posts are added/removed
    if (
      body?.head_commit?.added?.length > 0 ||
      body?.head_commit?.removed?.length > 0 ||
      body?.head_commit?.modified?.length > 0
    ) {
      revalidateTag('github-blogs');
    }

    return successResponse();
  } catch (error) {
    console.error('Error @ webhook-POST: ', error);
    return NextResponse.json({ error: 'Webhook POST error!' }, { status: 400 });
  }
}
