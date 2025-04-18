'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { RouteParams } from '../../../public/types';
import { blogPost } from '../../../public/static';

export default function BlogDetail(): React.ReactElement {
  const params = useParams<RouteParams>();
  const id = params.id;

  return (
    <div>
      <Link
        href='/blogs'
        className='text-blue-500 hover:text-blue-700 mb-4 inline-block'
      >
        ← Back to blogs
      </Link>

      <h1 className='text-3xl font-bold mb-2'>{blogPost.title}</h1>

      <div className='flex items-center text-gray-500 mb-6'>
        <span>By {blogPost.author}</span>
        <span className='mx-2'>•</span>
        <span>{blogPost.date}</span>
      </div>

      <div className='prose max-w-none'>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{blogPost.content}</pre>
      </div>
    </div>
  );
}
