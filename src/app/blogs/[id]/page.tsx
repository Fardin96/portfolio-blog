import Link from 'next/link';
import { formatDate } from '../../../utils/utils';
import {
  getGithubPostUsingFetch,
  getGithubPostsListUsingGraphQL,
  getLatestCommitCached,
} from '../../../utils/githubServices';
import '../../github-markdown.css';
import { mdToHtml } from '../../../utils/mdToHtml';

/**
 ** GENERATE STATIC PARAMS
 */
export async function generateStaticParams() {
  try {
    const posts = await getGithubPostsListUsingGraphQL('');
    return posts.map((post) => ({
      id: post.id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> {
  const { id: blogId } = await params;
  const data: any = await getGithubPostUsingFetch(`${blogId}/index.md`);
  const htmlContent = mdToHtml(data);

  // Get latest commit info for this blog post
  const commitInfo = await getLatestCommitCached(`${blogId}/index.md`);

  return (
    <div className='min-h-full flex flex-col px-4 sm:px-8 lg:px-35'>
      <div>
        <Link
          href='/blogs'
          className='text-blue-500 hover:text-blue-700 inline-block'
        >
          ← Back to blogs
        </Link>

        <div className='flex items-center text-gray-500 mb-6'>
          <span>By {data?.author?.name}</span>
          <span className='mx-2'>•</span>
          <span>{formatDate(data?.date)}</span>
        </div>

        {/* Display commit information if available */}
        {commitInfo && (
          <div className='text-sm text-gray-400 mb-4 space-y-1'>
            <p>
              Last updated on {formatDate(commitInfo.commit.author.date)} by{' '}
              {commitInfo.commit.author.name}
            </p>
            {commitInfo.commit.message && (
              <p className='text-xs italic'>
                "{commitInfo.commit.message.split('\n')[0]}"
              </p>
            )}
          </div>
        )}
      </div>

      <div
        className='markdown-body'
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* spacing */}
      <div className='py-4 sm:py-4 lg:py-10' />
    </div>
  );
}
