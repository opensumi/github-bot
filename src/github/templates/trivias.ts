import _ from 'lodash';
import { Repository } from '@octokit/webhooks-types';

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

export const titleTpl = _.template(
  '[{{ repo.name }}] {{ _.capitalize({{ event }}) }} {{ action }}',
) as (data: { repo: Repository; event: string; action: string }) => string;
