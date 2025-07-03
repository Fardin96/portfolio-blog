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
export function sortBlogPosts(blogPosts: BlogPost[]): BlogPost[] {
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
 ** EXTRACT BLOG METADATA FROM MARKDOWN CONTENT
 * @param dirName - Directory name (used as fallback title)
 * @param content - Markdown content to parse
 * @param path - File path
 * @returns BlogPost object with extracted metadata
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

  const hasFrontmatter = lines[0]?.trim() === '---';

  if (hasFrontmatter) {
    const metadata = parseFrontmatter(lines);
    title = metadata.title || title;
    description = metadata.description || '';
    date = metadata.date;

    // Extract description from content if not in frontmatter
    if (!description) {
      description = extractDescriptionFromContent(
        lines,
        metadata.frontmatterEnd
      );
    }
  } else {
    // Extract from content without frontmatter
    const contentMetadata = extractFromContent(lines);
    title = contentMetadata.title || title;
    description = contentMetadata.description || '';
  }

  return {
    id: dirName,
    title,
    description: truncateDescription(description),
    date,
    path,
  };
}

/**
 ** PARSE FRONTMATTER SECTION OF MARKDOWN CONTENT
 * @param lines - The lines of the markdown content
 * @returns An object with the parsed frontmatter data
 */
function parseFrontmatter(lines: string[]): {
  title: string;
  description: string;
  date: string | undefined;
  frontmatterEnd: number;
} {
  const frontmatterEnd = lines.findIndex(
    (line, index) => index > 0 && line.trim() === '---'
  );

  const result = {
    title: '',
    description: '',
    date: undefined as string | undefined,
    frontmatterEnd,
  };

  if (frontmatterEnd > 0) {
    const frontmatter = lines.slice(1, frontmatterEnd);

    for (const line of frontmatter) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim().replace(/['"]/g, '');

      switch (key.trim().toLowerCase()) {
        case 'title':
          result.title = value;
          break;
        case 'description':
          result.description = value;
          break;
        case 'date':
          result.date = value;
          break;
      }
    }
  }

  return result;
}

/**
 ** EXTRACT METADATA FROM CONTENT WITHOUT FRONTMATTER
 * @param lines - The lines of the markdown content
 * @returns An object with the extracted metadata
 */
function extractFromContent(lines: string[]): {
  title: string;
  description: string;
} {
  const firstHeading = lines.find((line) => line.startsWith('#'));
  const firstParagraph = lines.find(
    (line) => line.trim() && !line.startsWith('#')
  );

  return {
    title: firstHeading ? firstHeading.replace(/^#+\s*/, '') : '',
    description: firstParagraph?.trim() || '',
  };
}

/**
 ** EXTRACT DESCRIPTION FROM CONTENT AFTER FRONTMATTER
 * @param lines - The lines of the markdown content
 * @param frontmatterEnd - The index of the frontmatter end
 * @returns The extracted description
 */
function extractDescriptionFromContent(
  lines: string[],
  frontmatterEnd: number
): string {
  const contentAfterFrontmatter = lines.slice(frontmatterEnd + 1);

  const firstParagraph = contentAfterFrontmatter.find(
    (line) => line.trim() && !line.startsWith('#')
  );

  return firstParagraph?.trim() || '';
}

/**
 ** TRUNCATE DESCRIPTION IF IT EXCEEDS MAXIMUM LENGTH
 * @param description - The description to truncate
 * @returns The truncated description
 */
function truncateDescription(description: string): string {
  const maxLength = 150;

  return description.length > maxLength
    ? description.substring(0, maxLength) + '...'
    : description;
}
