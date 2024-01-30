import { Octokit } from '@octokit/rest';
export class PRService {
  constructor(protected _octo?: Octokit) {}

  getPullRequests = async (owner: string, repo: string, username: string) => {
    const octo = this._octo || new Octokit();
    const { data } = await octo.pulls.list({
      owner,
      repo,
      state: 'open',
      sort: 'created',
      direction: 'desc',
    });
    return data.filter((pr) => pr.user?.login === username);
  };
}
