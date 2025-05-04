import { NextRequest, NextResponse } from 'next/server';
import {
  WebhookData,
  WebhookPayload,
} from '../../../public/types/webhookTypes';

// const GITHUB_HOOK_SECRET: string = process.env.GITHUB_HOOK_SECRET;

declare global {
  var webhookData: WebhookData[];
}

export default async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const body = request.json() as WebhookPayload;

    // const signature = request.headers.get('x-hub-signature-256');
    const eventType = request.headers.get('x-github-event') || 'unknown';
    if (eventType === 'ping') {
      return NextResponse.json({ message: 'Pong!' });
    }

    console.log('received this payload: ', body);

    const timestamp = new Date().toISOString();
    const webhookData: WebhookData = {
      timestamp,
      eventType,
      payload: body,
      // repository:  || 'unknown',
      // sender: body.sender?.login
    };

    if (!global.webhookData) {
      global.webhookData = [];
    }
    global.webhookData.unshift(webhookData);

    return NextResponse.json({ success: true, message: 'Webhook received!' });
  } catch (error) {
    console.error('Error @ webhookroute.ts: ', error);
    return NextResponse.json({ error: 'Webhook error!' }, { status: 400 });
  }
}
