'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Post, RouteParams } from '../../../public/types';
import { getSinglePost } from '../../../functions/sanityFetch';

export default function ProjectDetail(): React.ReactElement {
  const [data, setData] = useState<Post | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const params = useParams<RouteParams>();
  const projectId: string = params.id;

  const fetchData = async (): Promise<void> => {
    setError('');

    try {
      const result: Post = await getSinglePost('Project', projectId);
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
        href='/projects'
        className='text-blue-500 hover:text-blue-700 mb-4 inline-block'
      >
        ← Back to projects
      </Link>

      <h1 className='text-3xl font-bold mb-4'>{data?.title}</h1>

      <div className='p-6 rounded-lg mb-6'>
        <h2 className='text-xl font-semibold mb-2'>Description</h2>
        <p>{data?.description}</p>
      </div>

      {data?.tags && data?.tags?.length > 0 && (
        <div className='mb-6'>
          <h2 className='text-xl font-semibold mb-2'>Technologies Used</h2>

          <div className='flex flex-wrap gap-2'>
            {data?.tags?.map((tech, index) => {
              return (
                <span
                  key={index}
                  className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'
                >
                  {tech.title}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className='flex gap-4'>
        <a
          href={data?.gitHubUrl}
          className='bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700'
        >
          GitHub Repository
        </a>

        <a
          href={data?.demoUrl}
          className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
        >
          Live Demo
        </a>
      </div>
    </div>
  );
}
