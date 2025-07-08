import Link from 'next/link';
import { formatDate, getAuthorName } from '../../../utils/utils';
import {
  getGithubPostUsingFetch,
  getGithubPostsListUsingGraphQL,
  getLatestCommitCached,
} from '../../../utils/githubServices';
import '../../github-markdown.css';
import { mdToHtml } from '../../../utils/mdToHtml';
import { techstack } from '../../../../public/static';

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

        <div className='flex items-center text-gray-500 italic mb-6'>
          <span>By {getAuthorName(commitInfo?.commit?.author?.name)}</span>
          <span className='mx-2'>•</span>
          <span>{formatDate(commitInfo?.commit?.author?.date)}</span>
        </div>
      </div>

      <div className='mb-6'>
        <h2 className='text-xl font-semibold mb-2'>Technologies Used</h2>

        <div className='flex flex-wrap gap-2'>
          {techstack?.tags?.map((tech, index) => {
            return (
              <span
                key={index}
                className='bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm'
              >
                {tech.title}
              </span>
            );
          })}
        </div>
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
