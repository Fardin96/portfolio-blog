import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    return NextResponse.json({
      webhooks: global.webhookData || [],
    });
  } catch (error) {
    console.log('Error @ webhook-GET: ', error);
    return NextResponse.json({ error: 'Webhook GET error!' }, { status: 400 });
  }
}
