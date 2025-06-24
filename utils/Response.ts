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

export function revalidateErrorResponse(): NextResponse {
  return NextResponse.json(
    { success: false, message: 'Error in revalidation API' },
    { status: 500 }
  );
}
