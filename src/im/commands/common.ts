import { IDingInfo } from '@/kv/types';
import { code } from '@opensumi/dingtalk-bot/lib/types';

import { DingKVManager } from '@/kv/ding';
import { IMCommandCenter } from './types';

export function registerCommonCommand(it: IMCommandCenter) {
  it.on(
    'putData',
    async ({ bot, session }, command) => {
      const info = {} as IDingInfo;
      if (command.args['defaultRepo']) {
        info['defaultRepo'] = command.args['defaultRepo'];
      }
      await DingKVManager.instance().updateGroupInfo(bot.id, info);
      await session.replyText('更新信息成功');
    },
    undefined,
  );

  it.on('getGroupInfo', async ({ session }) => {
    await session.reply(
      code(
        'json',
        JSON.stringify({
          conversationId: session.msg.conversationId,
          senderCorpId: session.msg.senderCorpId,
        }),
      ),
    );
  });
}
