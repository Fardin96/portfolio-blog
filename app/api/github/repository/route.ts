import { NextRequest, NextResponse } from 'next/server';
import { getRepositoryData } from '../../../../utils/githubServices';

export async function GET(request: NextRequest) {
  try {
    console.log('+----------------------GET-REQUEST-------------------+');
    console.log('request.url: ', request.url);
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '';
    console.log('path: ', path);

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
