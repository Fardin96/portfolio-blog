import { NextRequest, NextResponse } from 'next/server';
import { WebhookDataResponse } from '../../../../public/types/webhookTypes';
import { getRedisClient } from '../../../utils/redisClient';

/**
 ** GET WEBHOOK DATA
 * @param request - NextRequest
 * @returns NextResponse
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const redisClient = await getRedisClient();
    // redis client validation
    if (!redisClient) {
      return NextResponse.json(
        {
          webhookData: null,
          error: 'Redis client not found!',
        } as WebhookDataResponse,
        { status: 400 }
      );
    }

    const webhookData = await redisClient.get('webhookData');

    console.log('+---------------------GET-DATA------------------+');
    console.log('webhookData: ', webhookData);

    return NextResponse.json({
      webhookData: webhookData,
    } as WebhookDataResponse);
  } catch (error) {
    console.log('Error @ webhook-GET: ', error);

    return NextResponse.json(
      { error: 'Webhook GET error!', webhookData: null } as WebhookDataResponse,
      { status: 400 }
    );
  }
}
