import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import {
  internalServerErrorResponse,
  revalidateSuccessResponse,
} from '../../../utils/Response';

/**
 **REMOVE SPECIFIC PAGE CACHE-POST
 * @deprecated - uses directly
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { path } = body;

    const pathToRevalidate = path || '/blogs';

    revalidatePath(pathToRevalidate);

    console.log(
      '+-----------------------PATH-REVALIDATION--------------------------------+'
    );
    console.log(`Revalidated path: ${pathToRevalidate}`);
    console.log(
      '+-----------------------PATH-REVALIDATION--------------------------------+'
    );

    return revalidateSuccessResponse(pathToRevalidate);
  } catch (error) {
    console.error('Error in revalidation API: ', error);
    return internalServerErrorResponse('Error in revalidation API');
  }
}

/**
 ** REVALIDATE PATH-GET(MANUAL-TESTING)
 */
export async function GET() {
  try {
    revalidatePath('/blogs');
    return revalidateSuccessResponse('/blogs');
  } catch (error) {
    console.error('Error in revalidation GET-API: ', error);
    return internalServerErrorResponse('Error in revalidation API');
  }
}
