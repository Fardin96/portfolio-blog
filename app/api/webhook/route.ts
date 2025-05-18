import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';
import {
  WebhookData,
  WebhookPayload,
} from '../../../public/types/webhookTypes';

// const GITHUB_HOOK_SECRET: string = process.env.GITHUB_HOOK_SECRET;

// declare global {
//   var webhookData: WebhookData[];
// }

const redis = await createClient().connect();

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as WebhookPayload; //? doesn't have github data?

    // const signature = request.headers.get('x-hub-signature-256');
    const eventType = request.headers.get('x-github-event') || 'unknown';
    if (eventType === 'ping') {
      return NextResponse.json({ message: 'Pong!' });
    }

    console.log('received this payload: ', body); // ? how to log this?

    const timestamp = new Date().toISOString();
    const webhookData: WebhookData = {
      timestamp,
      eventType,
      payload: body,
      // repository:  || 'unknown',
      // sender: body.sender?.login
    };

    // ? how to store this data in vercel kv?
    await redis.set('webhookData', JSON.stringify(webhookData));

    // if (!global.webhookData) {
    //   global.webhookData = [];
    // }
    // global.webhookData.unshift(webhookData);

    // localStorage.setItem('webhookData', JSON.stringify(webhookData));

    return NextResponse.json({ success: true, message: 'Webhook received!' });
  } catch (error) {
    console.error('Error @ webhook-POST: ', error);
    return NextResponse.json({ error: 'Webhook POST error!' }, { status: 400 });
  }
}
