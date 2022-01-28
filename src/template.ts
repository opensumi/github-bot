import {
  WebhookEventName,
  WebhookEventMap,
  Repository,
  User,
  InstallationLite,
  Organization,
} from '@octokit/webhooks-types';
import { EmitterWebhookEventName } from '@octokit/webhooks/dist-types/types';

type ExtractPayload<TEmitterEvent extends EmitterWebhookEventName> =
  TEmitterEvent extends `${infer TWebhookEvent}.${infer _TAction}`
    ? WebhookEventMap[Extract<TWebhookEvent, WebhookEventName>]
    : WebhookEventMap[Extract<TEmitterEvent, WebhookEventName>];

type TemplateMapping = {
  [TEmitterEvent in EmitterWebhookEventName]?: (
    payload: ExtractPayload<TEmitterEvent>,
  ) => {
    title: string;
    text: string;
  };
};

export const templates = {
  'issues.opened': issuesOpened,
} as TemplateMapping;

export function getRepoLink({
  repository,
}: {
  repository: Repository;
  sender: User;
  installation?: InstallationLite;
  organization?: Organization;
}) {
  return `[\[${repository.full_name}\]](${repository.html_url})`;
}

export function getSenderLink({
  sender,
}: {
  repository: Repository;
  sender: User;
  installation?: InstallationLite;
  organization?: Organization;
}) {
  return `[${sender.login}](${sender.html_url})`;
}

export function issuesOpened(payload: ExtractPayload<'issues.opened'>) {
  const issue = payload.issue;
  return {
    title: `Issue opened: \#${issue.number} ${issue.title}`,
    text: `${getRepoLink(payload)} Issue opened by ${getSenderLink(
      payload,
    )}\n\n> #### [\#${issue.number} ${issue.title}](${issue.html_url})\n\n> ${
      issue.body ?? ''
    }`,
  };
}
