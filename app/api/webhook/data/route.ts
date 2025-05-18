import { NextRequest, NextResponse } from 'next/server';
import { WebhookDataResponse } from '../../../../public/types/webhookTypes';
import { createClient } from 'redis';
import { getRedisClient } from '../../../utils/redisClient';

// const redis = await createClient({ url: process.env.REDIS_URL }).connect();

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const redisClient = await getRedisClient();
    if (!redisClient) {
      return NextResponse.json(
        {
          webhooks: [],
          error: 'Redis client not found!',
        } as WebhookDataResponse,
        { status: 400 }
      );
    }

    const webhookData = await redisClient.get('test-key');

    let webhooks = [];
    if (webhookData) {
      // webhooks = await JSON.parse({webhookData as string});

      // convert to array if not already
      // if (!Array.isArray(webhooks)) {
      webhooks = [webhookData];
      // }
    }

    console.log('webhookdata: ', webhookData);
    console.log('webhooks: ', webhooks);

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
