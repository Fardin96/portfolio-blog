'use client';
import Link from 'next/link';

export default function Blogs() {
  // Example blog posts data
  const blogs = [
    {
      id: 1,
      title: 'Getting Started with Next.js',
      excerpt:
        'Learn how to build a modern web application with Next.js and React.',
      date: '2025-04-10',
    },
    {
      id: 2,
      title: 'The Power of TypeScript',
      excerpt:
        'Why TypeScript is becoming essential for modern JavaScript development.',
      date: '2025-04-01',
    },
    {
      id: 3,
      title: 'Styling in React Applications',
      excerpt: 'Comparing different styling approaches for React applications.',
      date: '2025-03-22',
    },
  ];

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
