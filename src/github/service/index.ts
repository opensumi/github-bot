import { Octokit } from '@octokit/rest';

import { TEAM_MEMBERS } from '@/im/commands/constants';

import {
  IOrganizationPrResult,
  IOrganizationNewContributionsResult,
} from '../../../libs/octo-service/src/types';

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

  const formattedString = format
    .replace('yyyy', String(year))
    .replace('MM', String(month))
    .replace('dd', String(date));

  return formattedString;
}
