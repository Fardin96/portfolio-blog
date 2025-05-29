import { Octokit } from '@octokit/rest';

const owner = process.env.GITHUB_OWNER || 'yourusername';
const repo = process.env.GITHUB_REPO || 'your-docs-repo';
const branch = process.env.GITHUB_BRANCH || 'main';

async function initOctokit(): Promise<Octokit> {
  try {
    const octokit = new Octokit({
      auth: process.env.REPOSITORY_ACCESS_TOKEN,
    });

    // const {
    //   data: { login },
    // } = await octokit.users.getAuthenticated();

    // console.log('+----------------------initOctokit-------------------+');
    // console.log(
    //   'process.env.REPOSITORY_ACCESS_TOKEN: ',
    //   process.env.REPOSITORY_ACCESS_TOKEN
    // );
    // console.log('octokit: ', octokit);
    // console.log('login: ', login);

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
      headers: {
        accept: 'application/vnd.github.html+json', // returns md content in html format
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    // const { data: data2 } = await octokit.request(
    //   `GET /repos/{owner}/{repo}/contents/{path}`,
    //   {
    //     owner: owner,
    //     repo: repo,
    //     path: path,
    //     headers: {
    //       accept: 'application/vnd.github.html+json',
    //       'X-GitHub-Api-Version': '2022-11-28',
    //     },
    //   }
    // );

    console.log('+----------------------GIT-DATA-------------------+');
    console.log('data from github octokit.repos.getContent: ', data);

    // console.log('+-------------------------------------------------+'); console.log('data from github octokit.request: ', data2);

    return data;
  } catch (error) {
    console.error('Error @ getRepositoryData: ', error);
    throw error;
  }
}
