import { NextRequest, NextResponse } from 'next/server';
import { getRepositoryData } from '../../../../utils/githubServices';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '';

    const data = await getRepositoryData(path);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in GitHub repository API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch repository data' },
      { status: 500 }
    );
  }
}
