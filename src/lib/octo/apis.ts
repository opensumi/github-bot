import { Octokit } from '@octokit/core';
import { App } from '.';

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
  constructor(private app: App) {}

  async octo() {
    const octo = await this.app.getInstallationOcto();
    if (!octo) {
      throw new Error('当前应用没有可用的安装');
    }
    return octo;
  }

  async getRepoStargazers(
    owner: string,
    repo: string,
    page?: number,
    perPage = 100,
  ) {
    const result = await (
      await this.octo()
    ).request('GET /repos/{owner}/{repo}/stargazers', {
      owner,
      repo,
      page: page,
      per_page: perPage,
    });
    return result;
  }

  async getRepoStargazersCount(owner: string, repo: string) {
    const resp = await (
      await this.octo()
    ).request('GET /repos/{owner}/{repo}', {
      owner,
      repo,
    });
    return resp.data.stargazers_count;
  }

  async getRepoStarRecords(owner: string, repo: string) {
    const patchRes = await this.getRepoStargazers(owner, repo);
    console.log(
      `🚀 ~ file: apis.ts ~ line 75 ~ APIWrapper ~ getRepoStarRecords ~ patchRes`,
      patchRes,
    );
    const headerLink = patchRes.headers['link'] || '';
    const MAX_REQUEST_AMOUNT = 15;

    let pageCount = 1;
    const regResult = /next.*?page=(\d*).*?last/.exec(headerLink);

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
            100 * (requestPages[index] - 1),
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
}
