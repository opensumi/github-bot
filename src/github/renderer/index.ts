import {
  IssuesTitleLink,
  PullRequestRefInfo,
} from '@/github/templates/components';
import { StringBuilder } from '@/utils/string-builder';
import type { IIssueDetail, IPrDetail } from '@opensumi/octo-service/lib/types';

export { render } from './template-engine';

export function renderPrOrIssue(data: IIssueDetail | IPrDetail) {
  const type = data.type === 'pr' ? 'Pull Request' : 'Issue';
  const issueNumber = data.issue.number;
  const title = `${type} ${issueNumber}`;
  const builder = new StringBuilder();
  builder.add(IssuesTitleLink(data.issue));
  if (data.type === 'pr') {
    builder.add(PullRequestRefInfo(data.pr));
  }

  builder.addDivider();

  if (data.type === 'pr') {
    builder.add(data.pr.body || '');
  } else {
    builder.add(data.issue.body || '');
  }

  return {
    title,
    text: builder.toString(),
  };
}
