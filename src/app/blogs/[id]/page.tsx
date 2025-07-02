import Link from 'next/link';
import { formatDate } from '../../../utils/utils';
import {
  getGithubPostUsingFetch,
  getGithubPostsListUsingGraphQL,
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
      </div>

      <p className='text-sm text-gray-400 mb-4'>
        last updated: {new Date().toLocaleString()}
      </p>

      <div
        className='markdown-body'
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* spacing */}
      <div className='py-4 sm:py-4 lg:py-10' />
    </div>
  );
}
