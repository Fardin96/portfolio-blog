import { BlogPost, GithubGraphQLRes } from './types/types';

/**
 ** FORMAT THE GITHUB GRAPHQL RESPONSE INTO A LIST OF BLOG POSTS
 * @param path - The path to the blog posts
 * @param res - The GitHub GraphQL response
 * @returns A list of blog posts
 */
export function formatGitGraphQlResponse(
  path: string,
  res: GithubGraphQLRes
): BlogPost[] {
  const blogPosts: BlogPost[] = [];

  if (res.repository?.object?.entries) {
    for (const entry of res.repository?.object?.entries) {
      if (entry.type === 'tree' && entry.object?.entries) {
        const mdFile = entry.object.entries.find(
          (file: any) => file.name.endsWith('.md') || file.name.endsWith('.mdx')
        );

        if (mdFile?.object.text) {
          const blogPost = extractBlogMetaData(
            entry.name,
            mdFile.object.text,
            `${path}${entry.name}/${mdFile.name}`
          );

          blogPosts.push(blogPost);
        }
      }
    }
  }

  return blogPosts;
}

/**
 ** SORT THE BLOG POSTS BY DATE
 * @param blogPosts - The list of blog posts
 * @returns A sorted list of blog posts
 */
export function sortedBlogPosts(blogPosts: BlogPost[]): BlogPost[] {
  return blogPosts.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }

    if (a.date && !b.date) {
      return -1;
    }
    if (!a.date && b.date) {
      return 1;
    }

    return a.title.localeCompare(b.title);
  });
}

/**
 ** EXTRACT BLOG METADATA
 * @param dirName
 * @param content
 * @param path
 * @returns BlogPost
 */
function extractBlogMetaData(
  dirName: string,
  content: string,
  path: string
): BlogPost {
  const lines = content.split('\n');
  let title = dirName;
  let description = '';
  let date: string | undefined = undefined;

  // Check if content starts with frontmatter
  if (lines[0]?.trim() === '---') {
    const frontmatterEnd = lines.findIndex(
      (line, index) => index > 0 && line.trim() === '---'
    );

    if (frontmatterEnd > 0) {
      // Parse frontmatter
      const frontmatter = lines.slice(1, frontmatterEnd);
      for (const line of frontmatter) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim().replace(/['"]/g, '');

        switch (key.trim().toLowerCase()) {
          case 'title':
            title = value;
            break;
          case 'description':
            description = value;
            break;
          case 'date':
            date = value;
            break;
        }
      }

      // If no description in frontmatter, get first paragraph after frontmatter
      if (!description) {
        const contentAfterFrontmatter = lines.slice(frontmatterEnd + 1);
        const firstParagraph = contentAfterFrontmatter.find(
          (line) => line.trim() && !line.startsWith('#')
        );
        description = firstParagraph?.trim() || '';
      }
    }
  } else {
    // No frontmatter, extract from content
    const firstHeading = lines.find((line) => line.startsWith('#'));
    if (firstHeading) {
      title = firstHeading.replace(/^#+\s*/, '');
    }

    // Get first non-heading line as description
    const firstParagraph = lines.find(
      (line) => line.trim() && !line.startsWith('#')
    );
    description = firstParagraph?.trim() || '';
  }

  // Truncate description if too long
  if (description.length > 150) {
    description = description.substring(0, 150) + '...';
  }

  return {
    id: dirName,
    title,
    description,
    date,
    path,
  };
}
