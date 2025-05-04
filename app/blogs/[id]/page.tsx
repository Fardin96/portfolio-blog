'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Post, RouteParams } from '../../../public/types/types';
import { useEffect, useState } from 'react';
import { getSinglePost } from '../../../functions/sanityFetch';
import { formatDate } from '../../../functions/utils';

export default function BlogDetail(): React.ReactElement {
  const [data, setData] = useState<Post | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const params: RouteParams = useParams<RouteParams>();
  const blogId: string = params.id;

  const fetchData = async (): Promise<void> => {
    setError('');

    try {
      const result: Post = await getSinglePost('blog', blogId);
      setData(result);
    } catch (err) {
      console.error('Failed to fetch posts:', err);

      const errMsg: string =
        err instanceof Error ? err.message : 'Unknown Error';
      setError(`Failed to fetch data: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Link
        href='/blogs'
        className='text-blue-500 hover:text-blue-700 mb-4 inline-block'
      >
        ← Back to blogs
      </Link>

      <h1 className='text-3xl font-bold mb-2'>{data?.title}</h1>

      <div className='flex items-center text-gray-500 mb-6'>
        <span>By {data?.author?.name}</span>
        <span className='mx-2'>•</span>
        <span>{formatDate(data?.date)}</span>
      </div>

      <div className='prose max-w-none'>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{data?.description}</pre>
      </div>
    </div>
  );
}
