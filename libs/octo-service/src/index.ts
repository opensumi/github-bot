import { Octokit } from '@octokit/rest';
import dayjs from 'dayjs';

import { PRService } from './pr';
import { IIssueDetail, IPrDetail, TCommitInfo, TPrData } from './types';

const PER_PAGE = 100;
const HISTORY_RANGE = 2 * 7 * 24 * 60 * 60 * 1000;

export interface IOrganizationPrResult {
  [login: string]: {
    details: string[];
    total: number;
  };
}

export interface IOrganizationNewContributionsResult {
  [full_name: string]: any;
}

export enum TEAM_MEMBERS {
  CONTRIBUTOR = 'contributor',
  CORE_MEMBER = 'core-member',
  MENTOR = 'mentor',
  NONE = 'none',
}

export const TEAM_MEMBER_PR_REQUIREMENT = {
  [TEAM_MEMBERS.CONTRIBUTOR]: 3,
  [TEAM_MEMBERS.CORE_MEMBER]: 5,
  [TEAM_MEMBERS.MENTOR]: 10,
};

export function formatDateString(
  t: Date | number | string,
  format = 'YYYY-MM-DD',
) {
  return dayjs(t).format(format);
}

export function range(from: number, to: number): number[] {
  const r: number[] = [];
  for (let i = from; i <= to; i++) {
    r.push(i);
  }
  return r;
}

export function meetTimeSpan(
  t: Date | number | string,
  from: number,
  to?: number,
) {
  const time = new Date(t).getTime();

  if (to) {
    return time >= from && time <= to;
  }

  return time >= from;
}

export class GitHubService {
  pr: PRService;
  constructor(protected _octo?: Octokit) {
    this.pr = new PRService(_octo);
  }

  set octo(o: Octokit) {
    this._octo = o;
  }

  get octo() {
    return this._octo!;
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
      sort: 'updated',
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
        starRecordsMap.set(
          formatDateString(starRecordsData[i].starred_at),
          i + 1,
        );
        i += Math.floor(starRecordsData.length / MAX_REQUEST_AMOUNT) || 1;
      }
    } else {
      resArray.map(({ data }, index) => {
        if (data.length > 0) {
          const starRecord = data[0] as {
            starred_at: string;
          };
          starRecordsMap.set(
            formatDateString(starRecord.starred_at),
            PER_PAGE * (requestPages[index] - 1),
          );
        }
      });
    }

    const stargazersCount = await this.getRepoStargazersCount(owner, repo);

    starRecordsMap.set(formatDateString(Date.now()), stargazersCount);

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
      latestStars.data[0].starred_at &&
      meetTimeSpan(latestStars.data[0].starred_at, from, to)
    ) {
      star_increment += latestStars.data.length;
      latestStars = await this.getRepoStargazers(owner, repo, pageCount--);
    }

    // 不需要判断第一位
    let startIndex = 1;

    for (startIndex = 1; startIndex < latestStars.data.length; startIndex++) {
      if (
        latestStars.data[startIndex] &&
        meetTimeSpan((latestStars.data[startIndex] as any).starred_at, from, to)
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
        if (!issues.data[index]) {
          continue;
        }
        if (meetTimeSpan(issues.data[index].updated_at, from, to)) {
          const item = issues.data[index];
          if (!item) {
            continue;
          }

          if (!item.html_url.includes('issues')) {
            // 说明获取到的为 PullRequest
            continue;
          }
          if (item.closed_at && meetTimeSpan(item.closed_at, from, to)) {
            issue_closed_increment++;
          }
          if (item.created_at && meetTimeSpan(item.created_at, from, to)) {
            issue_increment++;
          }
        } else {
          done = true;
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
    let bot_pull_increment = 0;

    let pull_closed_increment = 0;
    let bot_pull_closed_increment = 0;
    let pull_merged_increment = 0;
    let bot_pull_merged_increment = 0;

    let done = false;
    let pulls: Awaited<ReturnType<typeof this.getRepoPulls>>;
    let curPage = 1;
    while (!done && curPage <= pageCount) {
      pulls = await this.getRepoPulls(owner, repo, curPage++);

      for (let index = 0; index < pulls.data.length; index++) {
        const item = pulls.data[index];
        if (!item) {
          continue;
        }

        if (meetTimeSpan(item.updated_at, from, to)) {
          if (item.closed_at && meetTimeSpan(item.closed_at, from, to)) {
            pull_closed_increment++;
            if (item.user?.type === 'Bot') {
              bot_pull_closed_increment++;
            }
          }
          if (item.merged_at && meetTimeSpan(item.merged_at, from, to)) {
            pull_merged_increment++;
            if (item.user?.type === 'Bot') {
              bot_pull_merged_increment++;
            }
          }
          if (item.created_at && meetTimeSpan(item.created_at, from, to)) {
            pull_increment++;
            if (item.user?.type === 'Bot') {
              bot_pull_increment++;
            }
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
      pull_merged_increment,
      bot_pull_increment,
      bot_pull_closed_increment,
      bot_pull_merged_increment,
    };
  }

  async getRepoHistory(
    owner: string,
    repo: string,
    from: number = Date.now() - HISTORY_RANGE,
    to = Date.now(),
  ) {
    const issues = await this.getRepoIssueStatus(owner, repo, from, to);
    const pulls = await this.getRepoPullStatus(owner, repo, from, to);
    const star = await this.getRepoStarIncrement(owner, repo, from, to);
    const { count: star_count } = await this.getRepoStarRecords(owner, repo);

    return {
      from: new Date(from).toLocaleString('zh-cn'),
      to: new Date(to).toLocaleString('zh-cn'),
      star_count,
      ...issues,
      ...pulls,
      ...star,
    };
  }
  async getOrganizationRepos(org: string, isPrivate = false) {
    const result = await this.octo.repos.listForOrg({
      org,
    });
    if (isPrivate) {
      return result.data.filter((repo) => repo.private);
    }
    return result.data.filter((repo) => !repo.private);
  }

  async getOrganizationPRCount(
    owner: string,
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime(), // 最近30天的时间戳
    endDate = Date.now(),
  ) {
    const results: IOrganizationPrResult = {};
    const repos = await this.getOrganizationRepos(owner);
    for (const repo of repos) {
      if (repo.owner.login && repo.name) {
        const pulls = await this.octo.pulls.list({
          owner: repo.owner.login,
          repo: repo.name,
          state: 'all',
          per_page: 100,
          sort: 'created',
          direction: 'desc',
        });
        if (pulls.data.length <= 0) {
          continue;
        }
        for (const pull of pulls.data) {
          if (!pull.merged_at) {
            continue;
          }
          if (!meetTimeSpan(pull.merged_at, startDate, endDate)) {
            continue;
          }

          const login = pull.user?.login;
          if (!login) {
            continue;
          }
          if (!results[login]) {
            results[login] = { details: [], total: 0 };
          }
          if (!results[login].details.includes(repo.full_name)) {
            results[login].details.push(repo.full_name);
          }
          results[login].total += 1;
        }
      }
    }
    return results;
  }

  async getOrganizationNewContributors(
    owner: string,
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 最近30天的时间戳
    endDate = new Date().toISOString(),
  ) {
    const results: IOrganizationNewContributionsResult = {};
    const repos = await this.getOrganizationRepos(owner);
    for (const repo of repos) {
      console.log(`Get new contributions from ${repo.full_name}`);
      const newContributors = await this.getNewContributions(
        repo.owner.login,
        repo.name,
        startDate,
        endDate,
      );
      results[repo.full_name] = newContributors;
    }
    return results;
  }

  async getContributors(owner: string, repo: string, page = 1) {
    try {
      const { data } = await this.octo.repos.listContributors({
        owner,
        repo,
        page,
        per_page: 100,
      });
      return data;
    } catch (_e) {}
    return [];
  }

  async getCommits(
    owner: string,
    repo: string,
    page = 1,
    since: string,
    until: string,
  ) {
    try {
      const { data } = await this.octo.repos.listCommits({
        owner,
        repo,
        per_page: 100, // 每页返回最多100条记录
        page,
        since,
        until,
      });
      return data;
    } catch (_e) {}
    return [];
  }

  async getNewContributions(
    owner: string,
    repo: string,
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 最近30天的时间戳
    endDate = new Date().toISOString(),
  ) {
    let page = 1;
    let allContributors = await this.getContributors(owner, repo, page);
    while (
      allContributors &&
      allContributors.length &&
      allContributors.length % 100 === 0
    ) {
      page++;
      allContributors = allContributors.concat(
        await this.getContributors(owner, repo, page),
      );
    }
    page = 1;
    let allCommits = await this.getCommits(
      owner,
      repo,
      page,
      startDate,
      endDate,
    );
    while (allCommits.length && allCommits.length % 100 === 0) {
      page++;
      allCommits = allCommits.concat(
        await this.getCommits(owner, repo, page, startDate, endDate),
      );
    }
    const monthlyContributors = new Map();
    for (const commit of allCommits) {
      if (!commit.commit.committer?.date) {
        continue;
      }
      const login = commit.author?.login || commit.commit.committer?.name;
      if (
        !meetTimeSpan(
          commit.commit.committer.date,
          new Date(startDate).getTime(),
          new Date(endDate).getTime(),
        )
      ) {
        break;
      }
      monthlyContributors.set(login, (monthlyContributors.get(login) || 0) + 1);
    }

    const newContributions = [] as typeof allContributors;
    if (Array.isArray(allContributors)) {
      for (const contributor of allContributors) {
        if (
          contributor.contributions ===
          monthlyContributors.get(contributor.login)
        ) {
          newContributions.push(contributor);
        }
      }
    }
    console.log(
      `${owner}/${repo} 仓库新增贡献者数量：${newContributions.length}`,
    );
    return newContributions;
  }

  async getMembershipForUserInOrg(
    org: string,
    team_slug: string,
    username: string,
  ) {
    const result = await this.octo.teams.getMembershipForUserInOrg({
      org,
      team_slug,
      username,
    });
    return result.data;
  }

  async getMemberRole(org: string, username: string) {
    try {
      const isMentor =
        (
          await this.getMembershipForUserInOrg(
            org,
            TEAM_MEMBERS.MENTOR,
            username,
          )
        ).state === 'active';
      if (isMentor) {
        return TEAM_MEMBERS.MENTOR;
      }
    } catch (_e) {}
    try {
      const isCoreMember =
        (
          await this.getMembershipForUserInOrg(
            org,
            TEAM_MEMBERS.CORE_MEMBER,
            username,
          )
        ).state === 'active';
      if (isCoreMember) {
        return TEAM_MEMBERS.CORE_MEMBER;
      }
    } catch (_e) {}
    try {
      const isContributor =
        (
          await this.getMembershipForUserInOrg(
            org,
            TEAM_MEMBERS.CONTRIBUTOR,
            username,
          )
        ).state === 'active';
      if (isContributor) {
        return TEAM_MEMBERS.CONTRIBUTOR;
      }
    } catch (_e) {}
    return TEAM_MEMBERS.NONE;
  }

  async getPrByNumber(
    owner: string,
    repo: string,
    num: number,
  ): Promise<TPrData> {
    const result = await this.octo.pulls.get({
      owner,
      repo,
      pull_number: num,
    });
    return result.data;
  }

  async getIssuePrByNumber(
    owner: string,
    repo: string,
    num: number,
  ): Promise<IIssueDetail | IPrDetail | undefined> {
    try {
      const issues = await this.octo.issues.get({
        owner,
        repo,
        issue_number: num,
        headers: {
          Accept: 'application/vnd.github.full+json',
        },
      });
      if (issues.data.pull_request) {
        const result = await this.octo.pulls.get({
          owner,
          repo,
          pull_number: num,
        });
        return {
          type: 'pr',
          issue: issues.data,
          pr: result.data,
        };
      }

      return {
        type: 'issue',
        issue: issues.data,
      };
    } catch (error) {
      console.log(`🚀 ~ GitHubService ~ error:`, error);
      return undefined;
    }
  }

  /**
   * 如果该 ref 不存在则会报错
   * @param ref
   * @param owner
   * @param repo
   * @returns
   */
  async getRefInfoByRepo(
    ref: string,
    owner: string,
    repo: string,
  ): Promise<TCommitInfo> {
    const commit = await this.octo.repos.getCommit({
      owner,
      repo,
      ref,
    });
    return commit.data;
  }

  async checkRepoPermission(
    owner: string,
    repo: string,
    username: string,
    requestLevel: 'write' | 'admin',
  ) {
    // Permission levels higher in the array have higher access to the repo.
    const perms = ['none', 'read', 'write', 'admin'];

    const result = await this.octo.repos.getCollaboratorPermissionLevel({
      owner,
      repo,
      username,
    });

    const perm = result.data.permission;
    const requestPermIndex = perms.indexOf(requestLevel);
    const userPermIndex = perms.indexOf(perm);
    return userPermIndex >= requestPermIndex;
  }
}
