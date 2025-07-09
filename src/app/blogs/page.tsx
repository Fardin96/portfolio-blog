import { Suspense } from 'react';
import { BlogPost } from '../../utils/types/types';
import {
  getGithubPosts,
  getLatestCommitCached,
} from '../../utils/githubServices';
import { BlogsWithFilters } from '../../components/BlogsWithFilters';

export default async function Blogs(): Promise<React.ReactElement> {
  const data: BlogPost[] = await getGithubPosts('');

  // Fetch commit info for each blog in parallel
  const blogCommits = await Promise.all(
    data.map(async (blog) => {
      const commit = await getLatestCommitCached(`${blog.id}/index.md`);
      return { blogId: blog.id, commit };
    })
  );

  // Create a map for easy lookup
  const commitMap = new Map(
    blogCommits.map((item) => [item.blogId, item.commit])
  );

  // Extract unique tags from all blog posts
  const allTags = data
    .map((blog) => blog.tags || [])
    .flat()
    .filter(Boolean);

  // Get unique tags and sort them alphabetically
  const uniqueTags = Array.from(new Set(allTags)).sort();

  return (
    <Suspense fallback={<BlogsLoadingFallback />}>
      <BlogsWithFilters
        allBlogs={data}
        commitMap={commitMap}
        tags={uniqueTags}
      />
    </Suspense>
  );
}

function BlogsLoadingFallback() {
  return (
    <div>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-2 mb-6'>
        <h1 className='text-2xl sm:text-3xl font-bold'>My Blogs</h1>

        <div className='flex items-center gap-2 flex-wrap'>
          <div className='w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
          <div className='w-48 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
          <div className='w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
        </div>
      </div>

      <div className='space-y-6'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='border rounded-lg p-4 shadow animate-pulse'>
            <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2'></div>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2'></div>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4'></div>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-24'></div>
          </div>
        ))}
      </div>
    </div>
  );
}
