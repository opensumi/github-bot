import { RestEndpointMethodTypes } from '@octokit/rest';

export type IssueData =
  RestEndpointMethodTypes['issues']['get']['response']['data'];
export type TPrData =
  RestEndpointMethodTypes['pulls']['get']['response']['data'];

export type TCommitInfo =
  RestEndpointMethodTypes['repos']['getCommit']['response']['data'];

export interface IPrDetail {
  type: 'pr';
  issue: IssueData;
  pr: TPrData;
}
export interface IIssueDetail {
  type: 'issue';
  issue: IssueData;
}

export interface IOrganizationPrResult {
  [login: string]: {
    details: string[];
    total: number;
  };
}

export interface IOrganizationNewContributionsResult {
  [full_name: string]: any;
}
