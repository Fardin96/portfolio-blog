import { Octokit } from '@octokit/rest';
import { BlogPost, Post } from '../public/types/types';
import { unstable_cache } from 'next/cache';

const OWNER = process.env.GITHUB_OWNER || 'yourusername';
const REPO = process.env.GITHUB_REPO || 'your-docs-repo';
const BRANCH = process.env.GITHUB_BRANCH || 'main';

/**
 ** INITIALIZE OCTOKIT
 * @returns
 */
async function initOctokit(): Promise<Octokit> {
  try {
    const octokit = new Octokit({
      auth: process.env.REPOSITORY_ACCESS_TOKEN,
    });

    return octokit;
  } catch (error) {
    console.log('+----------------------initOctokit-------------------+');
    console.error('Error @ initOctokit: ', error);
    throw error;
  }
}

/**
 ** GET GITHUB REPOSITORY DATA(REST API)
 * @param path
 * @returns
 */
// todo: fix these types
export async function getRepositoryData(path: string = ''): Promise<any> {
  try {
    const octokit = await initOctokit();
    const { data } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path,
      ref: BRANCH,
      headers: {
        accept: 'application/vnd.github.raw+json', // returns the raw file
        // accept: 'application/vnd.github.html+json', // returns md content in html format
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    return data as unknown as Post;
  } catch (error) {
    console.error('Error @ getRepositoryData: ', error);
    throw error;
  }
}

/**
 ** GET GITHUB POSTS(GRAPHQL API)
 * @param path
 * @returns
 */
// todo: re-check all the types related to this function
export async function getGithubPostsFromAPI(
  path: string = ''
): Promise<BlogPost[]> {
  console.log('+----------------------GRAPH-QL-------------------+');
  try {
    const octokit = await initOctokit();

    //todo: refactor: move this to separate file
    const query = `
    query($owner: String!, $repo: String!, $expression: String!) {
      repository(owner: $owner, name: $repo) {
        object(expression: $expression) {
          ... on Tree {
            entries {
              name
              type
              object {
                ... on Tree {
                  entries {
                    name
                    type
                    object {
                      ... on Blob {
                        text
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

    // todo: fix this type
    const result: any = await octokit.graphql(query, {
      owner: OWNER,
      repo: REPO,
      expression: `main:${path}`,
    });

    // console.log('+----------------------GIT-DATA-------------------+');
    // console.log(
    //   'data from github octokit.graphql: ',
    //   JSON.stringify(result, null, 2)
    // );
    // console.log('+-------------------------------------------------+');

    const blogPosts: BlogPost[] = [];

    // format github blogs
    // todo: refactor: move this to separate function
    if (result.repository?.object?.entries) {
      for (const entry of result.repository?.object?.entries) {
        if (entry.type === 'tree' && entry.object?.entries) {
          const mdFile = entry.object.entries.find(
            (file: any) =>
              file.name.endsWith('.md') || file.name.endsWith('.mdx')
          );

          if (mdFile?.object.text) {
            const blogPost = await extractBlogMetaData(
              entry.name,
              mdFile.object.text,
              `${path}${entry.name}/${mdFile.name}`
            );

            blogPosts.push(blogPost);
          }
        }
      }
    }

    // console.log('+-------------------------------------------------+');
    // console.log('blogPosts: ', JSON.stringify(blogPosts, null, 2));
    // console.log('+-------------------------------------------------+');

    // return sorted blog posts
    // todo: refactor: move this to separate function
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
  } catch (error) {
    console.error('Error @ getRepositoryData: ', error);
    throw error;
  }
}

/**
 ** EXTRACT BLOG METADATA
 * @param dirName
 * @param content
 * @param path
 * @returns
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

/**
 ** GET CACHED GITHUB POST(CACHE-CONTROL)
 * @param path
 * @returns
 */
export function getCachedGithubPost(path: string = '') {
  return unstable_cache(
    () => getRepositoryData(path),
    [`github-blog-post-${path}`],
    {
      revalidate: 60 * 60 * 24,
      tags: [`github-blog-post-${path}`],
    }
  )();
}

/**
 ** GET CACHED GITHUB POSTS(CACHE-CONTROL)
 * @param path
 * @returns
 */
// todo: fix this type
const getCachedGithubPostList = unstable_cache(
  async (path: string = '') => {
    return await getGithubPostsFromAPI(path);
  },
  ['github-blogs'],
  {
    revalidate: 60 * 60 * 24, // 1 day
    tags: ['github-blogs'],
  }
);

/**
 ** GET GITHUB POSTS
 * @param path
 * @returns
 */
export async function getGithubPosts(path: string = '') {
  try {
    return await getCachedGithubPostList(path);
  } catch (error) {
    console.error('Error @ getGithubPosts: ', error);
    return [];
  }
}

/**
 ** GET GITHUB POST WITH FETCH ISR (APP ROUTER STYLE)
 * @param path
 * @returns
 */
export async function getGithubPostWithFetch(path: string = '') {
  try {
    // Using fetch with App Router ISR syntax
    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.REPOSITORY_ACCESS_TOKEN}`,
          Accept: 'application/vnd.github.raw+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        next: {
          revalidate: 60 * 60 * 24, // 24 hours
          tags: [`github-blog-post-${path}`],
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Error @ getGithubPostWithFetch: ', error);
    throw error;
  }
}

/**
 ** GET GITHUB POSTS LIST WITH FETCH ISR (APP ROUTER STYLE)
 * @param path
 * @returns
 */
export async function getGithubPostsWithFetch(
  path: string = ''
): Promise<BlogPost[]> {
  try {
    // Get directory contents using fetch with ISR
    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.REPOSITORY_ACCESS_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        next: {
          revalidate: 60 * 60 * 24, // 24 hours
          tags: ['github-blogs'],
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const contents = await response.json();
    const blogPosts: BlogPost[] = [];

    // Process each directory (blog post)
    for (const item of contents) {
      if (item.type === 'dir') {
        // Get the index.md file from each directory
        const indexResponse = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}${item.name}/index.md`,
          {
            headers: {
              Authorization: `Bearer ${process.env.REPOSITORY_ACCESS_TOKEN}`,
              Accept: 'application/vnd.github.raw+json',
              'X-GitHub-Api-Version': '2022-11-28',
            },
            next: {
              revalidate: 60 * 60 * 24, // 24 hours
              tags: [`github-blog-post-${item.name}/index.md`],
            },
          }
        );

        if (indexResponse.ok) {
          const content = await indexResponse.text();
          const blogPost = await extractBlogMetaData(
            item.name,
            content,
            `${path}${item.name}/index.md`
          );
          blogPosts.push(blogPost);
        }
      }
    }

    // Sort blog posts
    return blogPosts.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (a.date && !b.date) return -1;
      if (!a.date && b.date) return 1;
      return a.title.localeCompare(b.title);
    });
  } catch (error) {
    console.error('Error @ getGithubPostsWithFetch: ', error);
    return [];
  }
}
