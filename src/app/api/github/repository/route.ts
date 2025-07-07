import { NextRequest, NextResponse } from 'next/server';
import { getGithubPostsListUsingGraphQL } from '../../../../utils/githubServices';
import { validateSignature } from '../../../../utils/authServices';
import {
  internalServerErrorResponse,
  unauthorizedResponse,
} from '../../../../utils/Response';

/**
 ** GET GITHUB REPOSITORY DATA
 * @deprecated - currently integrated directly
 * @param request - NextRequest
 * @returns NextResponse
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    if (!validateSignature(request)) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '';

    const data = await getGithubPostsListUsingGraphQL(path);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in GitHub repository API:', error);

    return internalServerErrorResponse();
  }
}
