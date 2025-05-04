'use client';
import Link from 'next/link';
import { blogs } from '../../public/static';
import { useEffect, useState } from 'react';
import { AllPosts } from '../../public/types/types';
import { getAllPosts } from '../../functions/sanityFetch';
import { formatDate } from '../../functions/utils';

export default function Blogs(): React.ReactElement {
  const [data, setData] = useState<AllPosts[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async (): Promise<void> => {
    setError('');

    try {
      const result = await getAllPosts('blog');
      setData(result);
    } catch (err) {
      console.error('Failed to fetch posts:', err);

      const errMsg = err instanceof Error ? err.message : 'Unknown Error';
      setError(`Failed to fetch data: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // error view
  if (error.length > 0 && data.length === 0) {
    return (
      <div>
        <h1 className='text-3xl font-bold mb-6'>My Blog</h1>

        <h3>{error}</h3>
      </div>
    );
  }

  // loading view
  if (loading) {
    return (
      <div>
        <h1 className='text-3xl font-bold mb-6'>My Blog</h1>

        <h3>loading...</h3>
      </div>
    );
  }

  // empty view
  if (data.length === 0) {
    return (
      <div>
        <h1 className='text-3xl font-bold mb-6'>My Blog</h1>

        <h3>no projects yet :(</h3>
      </div>
    );
  }

  return (
    <div>
      <h1 className='text-3xl font-bold mb-6'>My Blog</h1>

      <div className='space-y-6'>
        {data.map((blog, idx) => (
          <div
            key={blog.id}
            className='border rounded-lg p-4 shadow transition-all duration-200 custom-dark-shadow'
          >
            <h2 className='text-2xl font-semibold mb-2'>{blog.title}</h2>
            <p className='text-gray-500 text-sm mb-2'>
              {formatDate(blog.date)}
            </p>
            <p className='text-gray-600 mb-4'>{blog.description}</p>

            <Link
              href={`/blogs/${blog.id}`}
              className='text-blue-500 hover:text-blue-700'
            >
              Read more →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
