import {
  renderPrOrIssueBody,
  renderPrOrIssueTitleLink,
  renderPrRefInfo,
} from '@/github/templates/utils';
import { StringBuilder } from '@/utils';

import { IIssueDetail, IPrDetail } from '../service/types';

export function render(data: IIssueDetail | IPrDetail) {
  const type = data.type === 'pr' ? 'Pull Request' : 'Issue';
  const issueNumber = data.issue.number;
  const title = `${type} ${issueNumber}`;
  const builder = new StringBuilder();
  builder.add(renderPrOrIssueTitleLink(data.issue));
  if (data.type === 'pr') {
    builder.add(renderPrRefInfo(data.pr));
  }

  builder.addDivider(undefined, true);

  if (data.type === 'pr') {
    builder.add(renderPrOrIssueBody(data.pr));
  } else {
    builder.add(renderPrOrIssueBody(data.issue));
  }

  return {
    title,
    text: builder.toString(),
  };
}
