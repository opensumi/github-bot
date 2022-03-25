// source: https://github.com/bytebase/star-history/blob/master/src/helpers/api.ts

import { Octokit } from '@octokit/rest';
import { App } from '.';

const PER_PAGE = 100;
const HISTORY_RANGE = 2 * 7 * 24 * 60 * 60 * 1000;

export function range(from: number, to: number): number[] {
  const r: number[] = [];
  for (let i = from; i <= to; i++) {
    r.push(i);
  }
  return r;
}

export function getTimeStampByDate(t: Date | number | string): number {
  const d = new Date(t);

  return d.getTime();
}

export function getDateString(
  t: Date | number | string,
  format = 'yyyy/MM/dd',
): string {
  const d = new Date(getTimeStampByDate(t));

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const date = d.getDate();

  const formatedString = format
    .replace('yyyy', String(year))
    .replace('MM', String(month))
    .replace('dd', String(date));

  return formatedString;
}
export class APIWrapper {
  _octo: Octokit | undefined;
  constructor(private app: App) {}

  get octo() {
    return this._octo as Octokit;
  }

  async init() {
    this._octo = (await this.app.getInstallationOcto()) as Octokit;
  }

  async getRepoStargazers(
    owner: string,
    repo: string,
    page?: number,
    perPage = PER_PAGE,
  ) {
    const result = await this.octo.request(
      'GET /repos/{owner}/{repo}/stargazers',
      {
        owner,
        repo,
        page: page,
        per_page: perPage,
        headers: {
          Accept: 'application/vnd.github.v3.star+json',
        },
      },
    );
    return result;
  }

  async getRepoIssues(
    owner: string,
    repo: string,
    page?: number,
    perPage = PER_PAGE,
  ) {
    const result = await this.octo.request('GET /repos/{owner}/{repo}/issues', {
      owner,
      repo,
      page: page,
      per_page: perPage,
      state: 'all',
      headers: {
        Accept: 'application/vnd.github.v3.json',
      },
    });
    return result;
  }

  async getRepoPulls(
    owner: string,
    repo: string,
    page?: number,
    perPage = PER_PAGE,
  ) {
    const result = await this.octo.request('GET /repos/{owner}/{repo}/pulls', {
      owner,
      repo,
      page: page,
      per_page: perPage,
      state: 'all',
      headers: {
        Accept: 'application/vnd.github.v3.json',
      },
    });
    return result;
  }

  async getRepoStargazersCount(owner: string, repo: string) {
    const resp = await this.octo.request('GET /repos/{owner}/{repo}', {
      owner,
      repo,
    });
    return resp.data.stargazers_count;
  }

  async getRepoStarRecords(owner: string, repo: string) {
    console.log('getRepoStarRecords');

    const patchRes = await this.getRepoStargazers(owner, repo);

    const headerLink = patchRes.headers['link'] || '';

    const MAX_REQUEST_AMOUNT = 15;

    let pageCount = 1;
    const regResult = /next.*page=(\d*).*?last/.exec(headerLink);

    if (regResult) {
      if (regResult[1] && Number.isInteger(Number(regResult[1]))) {
        pageCount = Number(regResult[1]);
      }
    }

    if (pageCount === 1 && patchRes?.data?.length === 0) {
      throw {
        response: patchRes,
        data: [],
      };
    }

    const requestPages: number[] = [];
    if (pageCount < MAX_REQUEST_AMOUNT) {
      requestPages.push(...range(1, pageCount));
    } else {
      range(1, MAX_REQUEST_AMOUNT).map((i) => {
        requestPages.push(Math.round((i * pageCount) / MAX_REQUEST_AMOUNT) - 1);
      });
      if (!requestPages.includes(1)) {
        requestPages.unshift(1);
      }
    }

    const resArray = await Promise.all(
      requestPages.map((page) => {
        return this.getRepoStargazers(owner, repo, page);
      }),
    );

    const starRecordsMap: Map<string, number> = new Map();

    if (requestPages.length < MAX_REQUEST_AMOUNT) {
      const starRecordsData: {
        starred_at: string;
      }[] = [];
      resArray.map((res) => {
        const { data } = res;
        if (data) {
          starRecordsData.push(
            ...(data as {
              starred_at: string;
            }[]),
          );
        }
      });
      for (let i = 0; i < starRecordsData.length; ) {
        starRecordsMap.set(getDateString(starRecordsData[i].starred_at), i + 1);
        i += Math.floor(starRecordsData.length / MAX_REQUEST_AMOUNT) || 1;
      }
    } else {
      resArray.map(({ data }, index) => {
        if (data.length > 0) {
          const starRecord = data[0] as {
            starred_at: string;
          };
          starRecordsMap.set(
            getDateString(starRecord.starred_at),
            PER_PAGE * (requestPages[index] - 1),
          );
        }
      });
    }

    const stargazersCount = await this.getRepoStargazersCount(owner, repo);

    starRecordsMap.set(getDateString(Date.now()), stargazersCount);

    const starRecords: {
      date: string;
      count: number;
    }[] = [];

    starRecordsMap.forEach((v, k) => {
      starRecords.push({
        date: k,
        count: v,
      });
    });

    return {
      records: starRecords,
      count: stargazersCount,
    };
  }

  async getRepoStarIncrement(
    owner: string,
    repo: string,
    from: number,
    to: number,
  ) {
    console.log('getRepoStarIncrement');
    const patchRes = await this.getRepoStargazers(owner, repo);

    const headerLink = patchRes.headers['link'] || '';

    let pageCount = 1;
    const regResult = /next.*page=(\d*).*?last/.exec(headerLink);

    if (regResult) {
      if (regResult[1] && Number.isInteger(Number(regResult[1]))) {
        pageCount = Number(regResult[1]);
      }
    }

    if (pageCount === 1 && patchRes?.data?.length === 0) {
      throw {
        response: patchRes,
        data: [],
      };
    }

    let star_increment = 0;
    let latestStars = await this.getRepoStargazers(owner, repo, pageCount--);
    while (
      latestStars.data &&
      latestStars.data[0] &&
      new Date(latestStars.data[0].starred_at).getTime() >= from
    ) {
      star_increment += latestStars.data.length;
      latestStars = await this.getRepoStargazers(owner, repo, pageCount--);
    }
    // 不需要判断第一位
    let startIndex = 1;
    for (startIndex = 1; startIndex++; startIndex < latestStars?.data?.length) {
      if (
        latestStars.data[startIndex] &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new Date((latestStars.data[startIndex] as any).starred_at).getTime() <=
          from
      ) {
        break;
      }
    }

    star_increment += latestStars?.data?.length - startIndex;

    return {
      star_increment,
    };
  }

  async getRepoIssueStatus(
    owner: string,
    repo: string,
    from: number,
    to: number,
  ) {
    console.log('getRepoIssueStatus');

    const patchRes = await this.getRepoIssues(owner, repo);

    const headerLink = patchRes.headers['link'] || '';

    let pageCount = 1;
    const regResult = /next.*page=(\d*).*?last/.exec(headerLink);

    if (regResult) {
      if (regResult[1] && Number.isInteger(Number(regResult[1]))) {
        pageCount = Number(regResult[1]);
      }
    }

    if (pageCount === 1 && patchRes?.data?.length === 0) {
      throw {
        response: patchRes,
        data: [],
      };
    }

    let issue_increment = 0;
    let issue_closed_increment = 0;
    let done = false;
    let issues;
    let curPage = 1;
    while (!done && curPage <= pageCount) {
      issues = await this.getRepoIssues(owner, repo, curPage++);
      for (let index = 0; index < issues?.data?.length; index++) {
        if (
          issues.data[index] &&
          new Date(issues.data[index].created_at).getTime() >= from
        ) {
          issue_increment++;
          if (issues.data[index].closed_at) {
            issue_closed_increment++;
          }
        } else {
          done = true;
          continue;
        }
      }
    }

    return {
      issue_increment,
      issue_closed_increment,
    };
  }

  async getRepoPullStatus(
    owner: string,
    repo: string,
    from: number,
    to: number,
  ) {
    console.log('getRepoPullStatus');

    const patchRes = await this.getRepoPulls(owner, repo);

    const headerLink = patchRes.headers['link'] || '';

    let pageCount = 1;
    const regResult = /next.*page=(\d*).*?last/.exec(headerLink);

    if (regResult) {
      if (regResult[1] && Number.isInteger(Number(regResult[1]))) {
        pageCount = Number(regResult[1]);
      }
    }

    if (pageCount === 1 && patchRes?.data?.length === 0) {
      throw {
        response: patchRes,
        data: [],
      };
    }

    let pull_increment = 0;
    let pull_closed_increment = 0;
    let done = false;
    let pulls;
    let curPage = 1;
    while (!done && curPage <= pageCount) {
      pulls = await this.getRepoPulls(owner, repo, curPage++);

      for (let index = 0; index < pulls?.data?.length; index++) {
        if (
          pulls.data[index] &&
          new Date(pulls.data[index].created_at).getTime() >= from
        ) {
          pull_increment++;
          if (pulls.data[index].closed_at) {
            pull_closed_increment++;
          }
        } else {
          done = true;
          continue;
        }
      }
    }

    return {
      pull_increment,
      pull_closed_increment,
    };
  }

  async getRepoHistory(owner: string, repo: string) {
    const from = Date.now() - HISTORY_RANGE;
    const to = Date.now();

    console.log('getRepoHistory');
    const issues = await this.getRepoIssueStatus(owner, repo, from, to);
    const pulls = await this.getRepoPullStatus(owner, repo, from, to);
    const star = await this.getRepoStarIncrement(owner, repo, from, to);
    const { count: star_count } = await this.getRepoStarRecords(owner, repo);

    return {
      // from: new Date(from).toISOString(),
      // to: new Date(to).toISOString(),
      star_count,
      ...issues,
      ...pulls,
      ...star,
    };
  }
}
