import { NextResponse } from 'next/server';
import { WebhookDataResponse } from '../../../../public/types/webhookTypes';
import { getRedisData } from '../../../../utils/redisServices';
import {
  errorResponse,
  notFoundResponse,
} from '../../../../utils/requestValidation';

/**
 ** GET WEBHOOK DATA
 * @returns NextResponse
 */
export async function GET(): Promise<NextResponse> {
  try {
    const webhookData = await getRedisData('webhookData');

    // handle no data found
    if (!webhookData) {
      return notFoundResponse();
    }

    return NextResponse.json({
      webhookData: webhookData,
    } as WebhookDataResponse);
  } catch (error) {
    console.log('Error @ webhook-GET: ', error);
    return errorResponse();
  }
}
