import { Octokit } from '@octokit/rest';

export class SearchService {
  constructor(private octo: Octokit) {}

  doSearch(q: string) {
    return this.octo.search.issuesAndPullRequests({
      q,
      sort: 'updated',
    });
  }
}
