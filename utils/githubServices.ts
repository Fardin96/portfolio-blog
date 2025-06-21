import { Octokit } from '@octokit/rest';
import { BlogPost } from '../public/types/types';

const owner = process.env.GITHUB_OWNER || 'yourusername';
const repo = process.env.GITHUB_REPO || 'your-docs-repo';
const branch = process.env.GITHUB_BRANCH || 'main';

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

export async function getRepositoryData(path: string = ''): Promise<any> {
  console.log('+----------------------REST-------------------+');
  try {
    const octokit = await initOctokit();
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
      headers: {
        accept: 'application/vnd.github.raw+json', // Returns the raw file contents for files and symlinks.
        // application/vnd.github.html+json // returns md content in html format
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    // console.log('+----------------------GIT-DATA-------------------+');
    // console.log('data from github octokit.repos.getContent: ', data);
    // console.log('+-------------------------------------------------+');

    return data;
  } catch (error) {
    console.error('Error @ getRepositoryData: ', error);
    throw error;
  }
}

export async function getGithubPosts(path: string = ''): Promise<BlogPost[]> {
  console.log('+----------------------GRAPH-QL-------------------+');
  try {
    const octokit = await initOctokit();

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

    const result: any = await octokit.graphql(query, {
      owner,
      repo,
      expression: `main:${path}`,
    });

    console.log('+----------------------GIT-DATA-------------------+');
    console.log('data from github octokit.graphql: ', result);
    console.log('+-------------------------------------------------+');

    const blogPosts: BlogPost[] = [];

    if (result.repository?.object?.entries) {
      for (const entry of result.repository?.object?.entries) {
        if (entry.type === 'tree' && entry.object?.entries) {
          const mdFile = entry.object.entries.find(
            (file: any) =>
              file.name.endswith('.md') || file.name.endswith('.mdx')
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
