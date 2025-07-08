import Link from 'next/link';
import { BlogPost } from '../../utils/types/types';
import { formatDate } from '../../utils/utils';
import {
  getGithubPosts,
  getLatestCommitCached,
} from '../../utils/githubServices';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
import { DropDown } from '../../components/DropDown';
import { CalendarTrigger } from '@/components/CalendarTrigger';

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
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold mb-6'>My Blogs</h1>

        <div className='flex items-center gap-2'>
          {/* <span className='text-sm text-gray-400'>filters :</span> */}

          <DropDown />

          <CalendarTrigger />
        </div>
      </div>

      {/* 
      <p className='text-sm text-gray-400 mb-4'>
        last updated: {new Date().toLocaleString()}
      </p> */}

      <div className='space-y-6'>
        {data.map((blog) => {
          const commit = commitMap.get(blog.id);

          return (
            <div
              key={blog.id}
              className='border rounded-lg p-4 shadow transition-all duration-200 custom-dark-shadow'
            >
              <h2 className='text-2xl font-semibold mb-2'>{blog.title}</h2>
              <p className='text-gray-500 text-sm mb-2'>
                {formatDate(commit.commit.author.date)}
              </p>
              <p className='text-gray-600 mb-4'>{blog.description}</p>

              <Link
                href={`/blogs/${blog.id}`}
                className='text-blue-500 hover:text-blue-700'
              >
                Read more →
              </Link>
            </div>
          );
        })}
      </div>

      {/* spacing */}
      <div className='py-4 sm:py-4 lg:py-10' />
    </div>
  );
}
