'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAllPosts } from '../../utils/sanityServices';
import { AllPosts } from '../../public/types/types';
import { projects } from '../../public/static';

export default function Projects(): React.ReactElement {
  const [data, setData] = useState<AllPosts[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async (): Promise<void> => {
    setError('');

    try {
      const result: AllPosts[] = await getAllPosts('Project');
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

  // error view
  if (error.length > 0 && data.length === 0) {
    return (
      <div>
        <h1 className='text-3xl font-bold mb-6'>My Projects</h1>

        <h3>{error}</h3>
      </div>
    );
  }

  // loading view
  if (loading) {
    return (
      <div>
        <h1 className='text-3xl font-bold mb-6'>My Projects</h1>

        <h3>loading...</h3>
      </div>
    );
  }

  // empty view
  if (data.length === 0) {
    return (
      <div>
        <h1 className='text-3xl font-bold mb-6'>My Projects</h1>

        <h3>no projects yet :(</h3>
      </div>
    );
  }

  // main view
  return (
    <div>
      <h1 className='text-3xl font-bold mb-6'>My Projects</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {data.map((project, idx) => (
          <div
            key={project.id}
            className='border rounded-lg p-4 shadow transition-all duration-200 custom-dark-shadow hover:scale-102'
          >
            <h2 className='text-xl font-semibold mb-2'>{project.title}</h2>
            <p className='text-gray-600 mb-4'>{project.description}</p>

            <Link
              href={`/projects/${project.id}`}
              className='text-blue-500 hover:text-blue-700'
            >
              View Project →
            </Link>
          </div>
        ))}
      </div>

      {/* spacing */}
      <div className='py-4 sm:py-4 lg:py-10' />
    </div>
  );
}
