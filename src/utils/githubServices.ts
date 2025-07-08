import { Octokit } from '@octokit/rest';
import { unstable_cache } from 'next/cache';
import { query } from './graphql/queries/githubPostsList';
import {
  formatGitGraphQlResponse,
  removeFrontmatter,
  sortBlogPosts,
} from './githubServicesHelpers';
import { BlogPost, GithubGraphQLRes, Post } from './types/types';

const OWNER = process.env.GITHUB_OWNER || 'yourusername';
const REPO = process.env.GITHUB_REPO || 'your-docs-repo';
const BRANCH = process.env.GITHUB_BRANCH || 'main';

/**
 ** INITIALIZE OCTOKIT
 * @returns Octokit instance
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
 * @deprecated: use getGithubPostWithFetch instead
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
 ** GET GITHUB POST WITH FETCH ISR
 * @param path
 * @returns Promise<string>
 */
export async function getGithubPostUsingFetch(
  path: string = ''
): Promise<string> {
  try {
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

    const content = await response.text();

    return removeFrontmatter(content);
  } catch (error) {
    console.error('Error @ getGithubPostWithFetch: ', error);
    throw error;
  }
}

/**
 ** GET GITHUB POSTS(GRAPHQL API)
 * @param path
 * @returns Promise<BlogPost[]>
 */
export async function getGithubPostsListUsingGraphQL(
  path: string = ''
): Promise<BlogPost[]> {
  try {
    const octokit = await initOctokit();

    const result: GithubGraphQLRes = await octokit.graphql(query, {
      owner: OWNER,
      repo: REPO,
      expression: `main:${path}`,
    });

    const blogPosts: BlogPost[] = formatGitGraphQlResponse(path, result);

    return sortBlogPosts(blogPosts);
  } catch (error) {
    console.error('Error @ getRepositoryData: ', error);
    throw error;
  }
}

/**
 ** GET CACHED GITHUB POSTS(CACHE-CONTROL)
 * @param path
 * @returns Promise<BlogPost[]>
 */
const getCachedGithubPostsList = unstable_cache(
  async (path: string = '') => {
    return await getGithubPostsListUsingGraphQL(path);
  },
  ['github-blogs'],
  {
    revalidate: 60 * 60 * 24, // 1 day
    tags: ['github-blogs'],
  }
);

/**
 ** GET CACHED GITHUB POSTS
 * @param path
 * @returns Promise<BlogPost[]>
 */
export async function getGithubPosts(path: string = ''): Promise<BlogPost[]> {
  try {
    return await getCachedGithubPostsList(path);
  } catch (error) {
    console.error('Error @ getGithubPosts: ', error);
    return [];
  }
}

/**
 ** GET LATEST COMMIT FOR SPECIFIC FILE
 * @param filePath - The file path (e.g., "blog-post-id/index.md")
 * @returns Promise<any>
 */
export async function getLatestCommitForFile(filePath: string): Promise<any> {
  try {
    const octokit = await initOctokit();

    const { data } = await octokit.repos.listCommits({
      owner: OWNER,
      repo: REPO,
      path: filePath,
      per_page: 1, // Only get the latest commit
    });

    return data[0] || null;
  } catch (error) {
    console.error('Error @ getLatestCommitForFile: ', error);
    return null;
  }
}

/**
 ** GET CACHED LATEST COMMIT FOR FILE
 * @param filePath - The file path
 * @returns Promise<any>
 */
const getCachedLatestCommit = unstable_cache(
  async (filePath: string) => {
    return await getLatestCommitForFile(filePath);
  },
  ['github-commit'],
  {
    revalidate: 60 * 60 * 24, // 24 hours
    tags: ['github-commit'],
  }
);

/**
 ** GET LATEST COMMIT WITH CACHE
 * @param filePath - The file path
 * @returns Promise<any>
 */
export async function getLatestCommitCached(filePath: string): Promise<any> {
  try {
    return await getCachedLatestCommit(filePath);
  } catch (error) {
    console.error('Error @ getLatestCommitCached: ', error);
    return null;
  }
}
