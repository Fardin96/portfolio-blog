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
    <BlogsWithFilters allBlogs={data} commitMap={commitMap} tags={uniqueTags} />
  );
}
