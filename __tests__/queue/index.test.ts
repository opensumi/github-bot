import 'dotenv/config';

import {
  EmitterWebhookEvent,
  EmitterWebhookEventName,
} from '@octokit/webhooks';

import { IGitHubEventQueueMessage } from '@/services/queue/types';

import { prepareEnv } from '../__mocks__';
import { MockMessageBatch } from '../__mocks__/queue/message';
import { MockGitHubEventWorker } from '../__mocks__/webhooks';
import {
  antd_mini_release_published,
  discussion_90_0_created,
  discussion_comment_90_0_created,
  issue_opened_event,
  pull_request_2_0_opened,
  pull_request_2_3_closed,
  pull_request_2_13_opened,
  pull_request_2_review_comment_0_created,
  pull_request_2_review_comment_1_created,
  pull_request_edited_base,
  pull_request_edited_wip,
  pull_request_review_4_submitted_changes_requested,
  pull_request_review_submitted_approved,
  release_published,
} from '../fixtures';

const botId = 'mock';

describe('queue', () => {
  beforeAll(() => {
    prepareEnv();
  });

  it('should work', async () => {
    const wk = new MockGitHubEventWorker('app');
    const events = [
      { name: 'pull_request', payload: pull_request_2_3_closed },
      { name: 'pull_request', payload: pull_request_2_0_opened },
      { name: 'pull_request', payload: pull_request_2_13_opened },
      { name: 'pull_request', payload: pull_request_edited_wip },
      { name: 'pull_request', payload: pull_request_edited_base },
      { name: 'issues', payload: issue_opened_event },
      { name: 'release', payload: release_published },
      { name: 'release', payload: antd_mini_release_published },
      {
        name: 'pull_request_review_comment',
        payload: pull_request_2_review_comment_0_created,
      },
    ] as { name: EmitterWebhookEventName; payload: any }[];

    const githubAppMessage = events.map((v) => ({
      botId,
      type: 'github-app',
      data: {
        id: `${Math.random()}`,
        name: v.name,
        payload: v.payload,
      },
    })) as IGitHubEventQueueMessage[];

    const batch = MockMessageBatch.from(githubAppMessage);
    batch.messages.forEach((v) => {
      wk.push(v);
    });

    await wk.run();
  });

  it('can composite pr review', async () => {
    expect.assertions(2);
    const wk = new MockGitHubEventWorker('app');
    const events = [
      {
        name: 'pull_request_review',
        payload: pull_request_review_4_submitted_changes_requested,
      },
      {
        name: 'pull_request_review_comment',
        payload: pull_request_2_review_comment_0_created,
      },
      {
        name: 'pull_request_review_comment',
        payload: pull_request_2_review_comment_1_created,
      },
    ] as { name: EmitterWebhookEventName; payload: any }[];

    const reviews = events.map((v) => ({
      botId,
      type: 'github-app',
      data: {
        id: `${Math.random()}`,
        name: v.name,
        payload: v.payload,
      },
    })) as IGitHubEventQueueMessage[];

    const batch = MockMessageBatch.from(reviews);
    wk.push(...batch.messages);

    wk.onBatchDoneForTest = (results) => {
      expect(results.length).toBe(1);
      expect(results).toMatchSnapshot();
    };

    await wk.run();
  });

  it('can composite pr review single', async () => {
    expect.assertions(2);
    const wk = new MockGitHubEventWorker('app');
    const events = [
      {
        name: 'pull_request_review',
        payload: pull_request_review_submitted_approved,
      },
    ] as { name: EmitterWebhookEventName; payload: any }[];

    const reviews = events.map((v) => ({
      botId,
      type: 'github-app',
      data: {
        id: `${Math.random()}`,
        name: v.name,
        payload: v.payload,
      },
    })) as IGitHubEventQueueMessage[];

    const batch = MockMessageBatch.from(reviews);
    wk.push(...batch.messages);

    wk.onBatchDoneForTest = (results) => {
      expect(results.length).toBe(1);
      expect(results).toMatchSnapshot();
    };

    await wk.run();
  });

  it('can composite pr review comment single', async () => {
    expect.assertions(2);
    const wk = new MockGitHubEventWorker('app');
    const events = [
      {
        name: 'pull_request_review_comment',
        payload: pull_request_2_review_comment_1_created,
      },
    ] as { name: EmitterWebhookEventName; payload: any }[];

    const reviews = events.map((v) => ({
      botId,
      type: 'github-app',
      data: {
        id: `${Math.random()}`,
        name: v.name,
        payload: v.payload,
      },
    })) as IGitHubEventQueueMessage[];

    const batch = MockMessageBatch.from(reviews);
    wk.push(...batch.messages);

    wk.onBatchDoneForTest = (results) => {
      expect(results.length).toBe(1);
      expect(results).toMatchSnapshot();
    };

    await wk.run();
  });

  it('can composite discussion', async () => {
    expect.assertions(2);
    const wk = new MockGitHubEventWorker('app');
    const events = [
      {
        name: 'discussion',
        payload: discussion_90_0_created,
      },
      {
        name: 'discussion_comment',
        payload: discussion_comment_90_0_created,
      },
    ] as EmitterWebhookEvent[];

    const reviews = events.map((v) => ({
      botId,
      type: 'github-app',
      data: {
        id: `${Math.random()}`,
        name: v.name,
        payload: v.payload,
      },
    })) as IGitHubEventQueueMessage[];

    const batch = MockMessageBatch.from(reviews);
    wk.push(...batch.messages);

    wk.onBatchDoneForTest = (results) => {
      expect(results.length).toBe(1);
      expect(results).toMatchSnapshot();
    };

    await wk.run();
  });
});
