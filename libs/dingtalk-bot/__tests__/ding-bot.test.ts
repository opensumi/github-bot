import { DingBotAdapter as BaseDingBotAdapter, Session } from '../src';

describe('bot-commander', () => {
  it('should work', () => {
    const example = {
      chatbotCorpId: 'corp1',
      chatbotUserId: 'user1',
      conversationId: 'conv1',
      conversationType: 'convType1',
      createAt: 1,
      isAdmin: true,
      msgId: 'msg1',
      msgtype: 'text' as const,
      robotCode: 'code1',
      senderCorpId: 'corp1',
      senderId: 'sender1',
      senderNick: 'nick1',
      senderStaffId: 'staff1',
      sessionWebhook: 'webhook1',
      sessionWebhookExpiredTime: 1,
      text: {
        content: '/hello',
      },
    };

    const session = new Session(example);
    const adapter = new BaseDingBotAdapter('bot1');

    adapter.cc.on('hello', async (ctx) => {
      const { session } = ctx;
      console.log(`===== ~ adapter.cc.on ~ ctx:`, ctx);
      await session.replyText('world');
    });

    adapter.handle(session);
  });
});
