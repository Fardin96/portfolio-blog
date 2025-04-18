'use client';
import Link from 'next/link';
import { blogs } from '../../public/static';

export default function Blogs(): React.ReactElement {
  return (
    <div>
      <h1 className='text-3xl font-bold mb-6'>My Blog</h1>

      <div className='space-y-6'>
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className='border rounded-lg p-4 shadow transition-all duration-200 custom-dark-shadow'
          >
            <h2 className='text-2xl font-semibold mb-2'>{blog.title}</h2>
            <p className='text-gray-500 text-sm mb-2'>{blog.date}</p>
            <p className='text-gray-600 mb-4'>{blog.excerpt}</p>

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
