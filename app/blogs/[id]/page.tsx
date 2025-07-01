import Link from 'next/link';
import { formatDate } from '../../../utils/utils';
import {
  getGithubPostWithFetch,
  getGithubPostsWithFetch,
} from '../../../utils/githubServices';
import showdown from 'showdown';
import '../../github-markdown.css';

export async function generateStaticParams() {
  try {
    const posts = await getGithubPostsWithFetch('');
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
  const data: any = await getGithubPostWithFetch(`${blogId}/index.md`);

  //* SHOWDOWN CONVERTER
  var converter = new showdown.Converter();
  converter.setOption('tables', true);
  converter.setOption('tasklists', true);
  converter.setOption('strikethrough', true);
  converter.setOption('underline', true);
  converter.setOption('footnotes', true);
  converter.setOption('smartLists', true);
  converter.setOption('smartypants', true);
  converter.setOption('openLinksInNewWindow', true);
  var htmlContent = converter.makeHtml(data);

  return (
    <div className='min-h-full flex flex-col px-4 sm:px-8 lg:px-35'>
      {/* <div className='px-4 md:px-8 lg:px-12 py-4 border-2 border-white-500'> */}
      <div className=''>
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

      {/* <h1 className='text-3xl font-bold mb-2'>{data?.title}</h1>
      <div>{htmlContent.value}</div>

      <div className='prose max-w-none'>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{data?.description}</pre>
      </div> */}
    </div>
  );
}
