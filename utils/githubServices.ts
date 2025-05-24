import crypto from 'crypto';
import { GitHookPayload } from '../public/types/webhookTypes';
import { Octokit } from '@octokit/rest';

const owner = process.env.GITHUB_OWNER || 'yourusername';
const repo = process.env.GITHUB_REPO || 'your-docs-repo';
const branch = process.env.GITHUB_BRANCH || 'main';

/**
 ** VALIDATE GITHUB SIGNATURE
 * @param request - NextRequest
 * @param signatureHeader - string
 * @returns boolean
 */
export function validateSignature(
  body: GitHookPayload,
  signatureHeader: string
): boolean {
  try {
    // validate webhook secret
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('Unknown request');
    }

    // validate signature algorithm
    const [algorithm, signature] = signatureHeader.split('=');
    if (algorithm !== 'sha256') {
      throw new Error('Unknown request');
    }

    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(JSON.stringify(body)).digest('hex');

    // return signature validation
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch (error) {
    console.error('Error @ validateSignature: ', error);
    return false;
  }
}

async function initOctokit(): Promise<Octokit> {
  try {
    const octokit = new Octokit({
      auth: process.env.REPOSITORY_ACCESS_TOKEN,
    });

    const {
      data: { login },
    } = await octokit.users.getAuthenticated();

    console.log('+----------------------initOctokit-------------------+');
    console.log(
      'process.env.REPOSITORY_ACCESS_TOKEN: ',
      process.env.REPOSITORY_ACCESS_TOKEN
    );
    console.log('octokit: ', octokit);
    console.log('login: ', login);

    return octokit;
  } catch (error) {
    console.log('+----------------------initOctokit-------------------+');
    console.error('Error @ initOctokit: ', error);
    throw error;
  }
}

export async function getRepositoryData(path: string = ''): Promise<any> {
  console.log('+------------------getRepositoryData-------------------------+');
  try {
    const octokit = await initOctokit();
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
      mediaType: {
        format: 'application/vnd.github.html+json', // returns md content in html format
      },
    });

    console.log('+----------------------GIT-DATA-------------------+');
    console.log('data from github: ', data);

    return data;
  } catch (error) {
    console.error('Error @ getRepositoryData: ', error);
    throw error;
  }
}
