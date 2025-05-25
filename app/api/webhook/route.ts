import { NextRequest, NextResponse } from 'next/server';
import {
  WebhookData,
  GitHookPayload,
} from '../../../public/types/webhookTypes';
import { setRedisData } from '../../../utils/redisServices';
import { validateGithubSignature } from '../../../utils/authServices';

/**
 ** GITHUB WEBHOOK ENDPOINT
 * @param request - NextRequest
 * @returns NextResponse
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const signature = request.headers.get('X-Hub-Signature-256');

    // handle JSON parsing error
    let body: GitHookPayload;
    try {
      body = (await request.json()) as GitHookPayload;
    } catch (jsonError: unknown) {
      console.error('Error parsing JSON body:', jsonError);
      return NextResponse.json(
        { success: false, message: 'Unauthorized!' },
        { status: 400 }
      );
    }

    // auth
    const isValid =
      signature && // signature exists
      body && // body exists
      Object.keys(body).length > 0 && // body is not empty
      validateGithubSignature(body, signature); // signature is valid

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized!',
        },
        { status: 401 }
      );
    }

    // events validation
    const eventType = request.headers.get('x-github-event') || 'unknown';
    if (eventType === 'ping') {
      return NextResponse.json({ message: 'Pong!' });
    } else if (eventType === 'unknown') {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized!',
        },
        { status: 401 }
      );
    }

    // payload
    const timestamp = new Date().toISOString();
    const payload = {
      commits: body.commits,
      head_commit: body.head_commit,
    };
    const webhookData: WebhookData = {
      timestamp,
      eventType,
      payload,
    };

    // store data in redis DB
    await setRedisData('webhookData', JSON.stringify(webhookData));

    // return success response
    return NextResponse.json({
      success: true,
      message: 'Github webhook received!',
    });
  } catch (error) {
    console.error('Error @ webhook-POST: ', error);
    return NextResponse.json({ error: 'Webhook POST error!' }, { status: 400 });
  }
}
