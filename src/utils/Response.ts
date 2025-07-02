import { NextResponse } from 'next/server';

export function revalidateSuccessResponse(
  pathToRevalidate: string
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      message: 'Revalidation successful. Path: ' + pathToRevalidate,
    },
    { status: 200 }
  );
}

export function successResponse() {
  return NextResponse.json({
    success: true,
    message: 'Github webhook received!',
  });
}

export function errorResponse() {
  return NextResponse.json(
    { error: 'Webhook GET error!', webhookData: null },
    { status: 400 }
  );
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, message: 'Unauthorized!' },
    { status: 401 }
  );
}

export function notFoundResponse() {
  return NextResponse.json(
    {
      error: 'Webhook data not found!',
      webhookData: null,
    },
    { status: 404 }
  );
}

export function internalServerErrorResponse(
  msg: string = 'Failed to fetch repository data'
) {
  return NextResponse.json({ success: false, error: msg }, { status: 500 });
}
