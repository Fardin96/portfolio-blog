import Link from 'next/link';
import { BlogPost } from '../../utils/types/types';
import { formatDate } from '../../utils/utils';
import { getGithubPosts } from '../../utils/githubServices';

export default async function Blogs(): Promise<React.ReactElement> {
  const data: BlogPost[] = await getGithubPosts('');

  // empty view
  if (data.length === 0) {
    return (
      <div>
        <h1 className='text-3xl font-bold mb-6'>My Blog</h1>

        <h3>no blogs yet :(</h3>
      </div>
    );
  }

  // main view
  return (
    <div>
      <h1 className='text-3xl font-bold mb-6'>My Blogs</h1>

      <p className='text-sm text-gray-400 mb-4'>
        last updated: {new Date().toLocaleString()}
      </p>

      <div className='space-y-6'>
        {data.map((blog) => (
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

      {/* spacing */}
      <div className='py-4 sm:py-4 lg:py-10' />
    </div>
  );
}
