import { Octokit } from '@octokit/rest';

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

export async function getGithubPosts(path: string = ''): Promise<any> {
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

    const result = await octokit.graphql(query, {
      owner,
      repo,
      expression: `main:${path}`,
    });

    console.log('+----------------------GIT-DATA-------------------+');
    console.log('data from github octokit.graphql: ', result);
    console.log('+-------------------------------------------------+');

    const blogPosts = []; //todo: type this

    if (result.repository?.object?.entries) {
      for (const entry of result.repository?.object?.entries) {
        if (entry.type === 'tree' && entry.object?.entries) {
          const mdFile = entry.object.entries.find(
            (file: any) =>
              file.name.endswith('.md') || file.name.endswith('.mdx')
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
