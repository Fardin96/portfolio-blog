import { NextRequest, NextResponse } from 'next/server';
import {
  WebhookData,
  GitHookPayload,
} from '../../../public/types/webhookTypes';
import { setRedisData } from '../../utils/redisServices';

/**
 ** GITHUB WEBHOOK ENDPOINT
 * @param request - NextRequest
 * @returns NextResponse
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // const signature = request.headers.get('x-hub-signature-256');
    const eventType = request.headers.get('x-github-event') || 'unknown';

    // events validation
    if (eventType === 'ping') {
      return NextResponse.json({ message: 'Pong!' });
    } else if (eventType === 'unknown') {
      return NextResponse.json({
        success: false,
        message: 'Unknown event type!',
      });
    }

    const body = (await request.json()) as GitHookPayload;
    // console.log('+---------------------POST-DATA------------------+');
    // console.log('received this payload: ', body);

    // payload
    const timestamp = new Date().toISOString();
    const payload = {
      commits: body.commits,
      head_commit: body.head_commit,
    };

    // required data
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
