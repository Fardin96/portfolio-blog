import { NextRequest, NextResponse } from 'next/server';
import { WebhookDataResponse } from '../../../../public/types/webhookTypes';
import { createClient } from 'redis';
import redisClient from '../../../utils/redisClient';

// const redis = await createClient({ url: process.env.REDIS_URL }).connect();

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const webhookData = await redisClient.get('webhookData');

    let webhooks = [];
    if (webhookData) {
      webhooks = await JSON.parse(webhookData as string);

      // convert to array if not already
      if (!Array.isArray(webhooks)) {
        webhooks = [webhooks];
      }
    }

    return NextResponse.json({
      webhooks: webhooks,
    } as WebhookDataResponse);
  } catch (error) {
    console.log('Error @ webhook-GET: ', error);

    return NextResponse.json(
      { error: 'Webhook GET error!', webhooks: [] } as WebhookDataResponse,
      { status: 400 }
    );
  }
}
