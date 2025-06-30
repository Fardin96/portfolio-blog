import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Post, RouteParams } from '../../../public/types/types';
import { useEffect, useState } from 'react';
import { getSinglePost } from '../../../utils/sanityServices';
import { formatDate } from '../../../utils/utils';
import {
  getCachedGithubPost,
  getRepositoryData,
} from '../../../utils/githubServices';
import { mdToHtml } from '../../../utils/mdToHtml';
import showdown from 'showdown';
// import styles from '../../mdStyle.module.css';
import '../../mdStyle.css';
import '../../github-markdown.css';

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> {
  const { id: blogId } = await params;
  // const data: any = await getCachedGithubPost(`${blogId}/index.md`);
  const data: any = await getRepositoryData(`${blogId}/index.md`);
  // let data: any;
  // const htmlContent: any = await getRepositoryData(`${blogId}/index.md`);
  // const htmlContent = await mdToHtml(data);

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

  // console.log('blogId: ', blogId);
  // console.log('data: ', data);

  // const [data, setData] = useState<Post | null>(null);
  // const [error, setError] = useState<string>('');
  // const [loading, setLoading] = useState<boolean>(true);

  // const params: RouteParams = useParams<RouteParams>();
  // const blogId: string = params.id;

  // const fetchData = async (): Promise<void> => {
  //   setError('');

  //   try {
  //     const result: Post = await getSinglePost('blog', blogId);
  //     setData(result);
  //   } catch (err) {
  //     console.error('Failed to fetch posts:', err);

  //     const errMsg: string =
  //       err instanceof Error ? err.message : 'Unknown Error';
  //     setError(`Failed to fetch data: ${errMsg}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   // fetchData();
  // }, []);

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
