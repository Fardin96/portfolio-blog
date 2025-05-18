import { NextRequest, NextResponse } from 'next/server';
import { WebhookDataResponse } from '../../../../public/types/webhookTypes';
import { createClient } from 'redis';

const redis = await createClient().connect();

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const webhookData = await redis.get('webhookData');

    return NextResponse.json({
      webhooks: webhookData || [],
    } as WebhookDataResponse);
  } catch (error) {
    console.log('Error @ webhook-GET: ', error);
    return NextResponse.json(
      { error: 'Webhook GET error!', webhooks: [] } as WebhookDataResponse,
      { status: 400 }
    );
  }
}
