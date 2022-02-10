import { Repository } from '@octokit/webhooks-types';
import _ from 'lodash';

type TitleTpl = (data: {
  repo: Repository;
  event: string;
  action: string;
}) => string;

export const titleTpl: TitleTpl = (data) => {
  return `[${data.repo.name}] ${_.capitalize(data.event)} ${data.action}`;
};
