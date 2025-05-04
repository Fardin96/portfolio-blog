import { NextRequest, NextResponse } from 'next/server';
import { WebhookDataResponse } from '../../../../public/types/webhookTypes';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    return NextResponse.json({
      webhooks: global.webhookData || [],
    } as WebhookDataResponse);
  } catch (error) {
    console.log('Error @ webhook-GET: ', error);
    return NextResponse.json(
      { error: 'Webhook GET error!', webhooks: [] } as WebhookDataResponse,
      { status: 400 }
    );
  }
}
