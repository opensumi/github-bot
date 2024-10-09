let content: any | undefined;
jest.mock('@opensumi/dingtalk-bot/lib/utils', () => {
  // Require the original module to not be mocked...
  const originalModule = jest.requireActual('@opensumi/dingtalk-bot/lib/utils');

  return {
    __esModule: true, // Use it when dealing with esModules
    ...originalModule,
    send: async (_content: any) => {
      console.log('====================================');
      console.log(_content);
      console.log('====================================');
      content = _content;
    },
  };
});

import { DingtalkService } from '@/services/dingtalk';

describe('can send content to dingtalk', () => {
  it('can filter event', async () => {
    content = undefined;
    await DingtalkService.instance().sendContentToDing(
      {
        a: 1,
      },
      'branch_protection_rule',
      {
        githubSecret: '',
        contentLimit: 300,
        dingWebhooks: [
          {
            secret: 'test',
            url: '',
            event: [
              'release.released',
              'discussion_comment.created',
              'discussion.created',
            ],
          },
        ],
      },
    );
    expect(content).toBe(undefined);
  });
  it('can filter event', async () => {
    content = undefined;
    const data = {
      a: 1,
    };
    await DingtalkService.instance().sendContentToDing(
      data,
      'discussion_comment.created',
      {
        githubSecret: '',
        contentLimit: 300,
        dingWebhooks: [
          {
            secret: '',
            url: '',
            event: [
              'release.released',
              'discussion_comment.created',
              'discussion.created',
            ],
          },
        ],
      },
    );
    expect(content).toBe(data);
  });
});
