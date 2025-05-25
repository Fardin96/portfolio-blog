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
    const reqClone: NextRequest = request.clone() as NextRequest;
    const bodyTxt = await reqClone.text();
    let body: GitHookPayload | undefined = undefined;

    if (bodyTxt.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized!' },
        { status: 400 }
      );
    }

    // if body is not empty
    try {
      body = await request.json();
      console.log('body: ', body);
    } catch (jsonError: unknown) {
      console.error('Error parsing JSON body:', jsonError);
      return NextResponse.json(
        // { success: false, message: 'Unauthorized!' },
        { success: false, message: 'Invalid request body: Malformed JSON.' },
        { status: 400 }
      );
    }

    // auth
    const isSignatureValid =
      signature && validateGithubSignature(bodyTxt, signature); // Use raw bodyTxt for signature validation

    // Check if the body (if it was expected and parsed) is not empty.
    // This check is separate because signature validation uses the raw text.
    const isBodyPopulated: boolean = body
      ? Object.keys(body).length > 0 // if false: body is not empty; no keys either!
      : false;

    if (!(isSignatureValid && isBodyPopulated)) {
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
      commits: body!.commits, // Added non-null assertion as body will be populated if we reach here
      head_commit: body!.head_commit, // Added non-null assertion
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
