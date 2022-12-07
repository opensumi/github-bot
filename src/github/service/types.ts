import { RestEndpointMethodTypes } from '@octokit/rest';

export type IssueData =
  RestEndpointMethodTypes['issues']['get']['response']['data'];
export type PrData =
  RestEndpointMethodTypes['pulls']['get']['response']['data'];

export interface IPrDetail {
  type: 'pr';
  issue: IssueData;
  pr: PrData;
}
export interface IIssueDetail {
  type: 'issue';
  issue: IssueData;
}
