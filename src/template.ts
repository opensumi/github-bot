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
  return `[${repository.full_name}](${repository.html_url})`;
}

export function getUserLink({
  sender,
}: {
  repository: Repository;
  sender: User;
  installation?: InstallationLite;
  organization?: Organization;
}) {
  return `[${sender.name ?? 'UNKNOWN'}](${sender.html_url})`;
}

export function issuesOpened(payload: ExtractPayload<'issues.opened'>) {
  const issue = payload.issue;
  return {
    title: `Issue ${issue.number} opened: ${issue.title}`,
    text: `${getRepoLink(payload)} Issue ${
      issue.number
    } opened by ${getUserLink(payload)}\n\n${issue.title}\n\n${
      issue.body ?? ''
    }`,
  };
}
