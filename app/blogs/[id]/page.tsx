'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function BlogDetail() {
  const params = useParams();
  const id = params.id;

  // In a real app, you would fetch this data from an API or database
  const blogPost = {
    title: `Blog Post ${id}`,
    date: 'April 15, 2025',
    author: 'Farabi',
    content: `
      This is the full content of the blog post. In a real application, this would be 
      fetched based on the blog post ID. You could use Markdown or a rich text editor 
      to create and store your blog content.
      
      ## Heading
      
      This is a paragraph with some **bold text** and *italic text*.
      
      - List item 1
      - List item 2
      - List item 3
      
      ### Code Example
      
      \`\`\`javascript
      function greeting() {
        console.log("Hello, world!");
      }
      \`\`\`
      
      You can expand this with more content as needed.
    `,
  };

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
