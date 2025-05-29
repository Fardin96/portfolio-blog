import { NextRequest, NextResponse } from 'next/server';
import { WebhookDataResponse } from '../../../../public/types/webhookTypes';
import { getRedisData } from '../../../../utils/redisServices';

/**
 ** GET WEBHOOK DATA
 * @returns NextResponse
 */
export async function GET(): Promise<NextResponse> {
  try {
    const webhookData = await getRedisData('webhookData');

    // handle no data found
    if (!webhookData) {
      return NextResponse.json(
        {
          error: 'Webhook data not found!',
          webhookData: null,
        } as WebhookDataResponse,
        { status: 404 }
      );
    }

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
