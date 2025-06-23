import Link from 'next/link';
// import { useEffect, useState } from 'react';
import { AllPosts, BlogPost } from '../../public/types/types';
import { getAllPosts } from '../../utils/sanityServices';
import { formatDate } from '../../utils/utils';
import { fetchWebhookData } from '../../utils/webhookServices';
import { WebhookData } from '../../public/types/webhookTypes';
import { getGithubPosts, getRepositoryData } from '../../utils/githubServices';

async function fetchGithubBlogs(): Promise<BlogPost[]> {
  try {
    // const response = await fetch(
    //   // '/api/github/repository?path=http-response-fundamentals/http-response-fundamentals.md'
    //   '/api/github/repository'
    // );
    const data = await getGithubPosts('');

    // const result = await data.json();
    console.log('GitHub repository data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching repository data:', error);
  }
}

export default async function Blogs(): Promise<React.ReactElement> {
  // const [data, setData] = useState<AllPosts[]>([]);
  // const [error, setError] = useState<string>('');
  // const [loading, setLoading] = useState<boolean>(true);
  // const [webhookData, setWebhookData] = useState<WebhookData | null>(null);

  const data: BlogPost[] = await fetchGithubBlogs();

  // const fetchSanityData = async (): Promise<void> => {
  //   setError('');

  //   try {
  //     const result = await getAllPosts('blog');
  //     // setData(result);
  //   } catch (err) {
  //     console.error('Failed to fetch posts:', err);

  //     const errMsg = err instanceof Error ? err.message : 'Unknown Error';
  //     setError(`Failed to fetch data: ${errMsg}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // let res;
  // useEffect(() => {
  //   (async () => {
  //     // await fetchWebhookData(setWebhookData);
  //     await fetchGithubBlogs();
  //   })();
  // }, []);

  // setData(res);
  // console.log('posts: ', JSON.stringify(res, null, 2));

  // useEffect(() => {
  //   fetchSanityData();
  // }, []);

  // // error view
  // if (error.length > 0 && data.length === 0) {
  //   return (
  //     <div>
  //       <h1 className='text-3xl font-bold mb-6'>My Blog</h1>

  //       <h3>{error}</h3>
  //     </div>
  //   );
  // }

  // // loading view
  // if (loading) {
  //   return (
  //     <div>
  //       <h1 className='text-3xl font-bold mb-6'>My Blog</h1>

  //       <h3>loading...</h3>
  //     </div>
  //   );
  // }

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
    </div>
  );
}
