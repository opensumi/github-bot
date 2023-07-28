import 'dotenv/config';

import qrcodeTerminal from 'qrcode-terminal';
import { Contact, Message, ScanStatus, WechatyBuilder, log } from 'wechaty';

function onScan(qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(qrcode),
    ].join('');
    log.info(
      'StarterBot',
      'onScan: %s(%s) - %s',
      ScanStatus[status],
      status,
      qrcodeImageUrl,
    );

    qrcodeTerminal.generate(qrcode, { small: true }); // show qrcode on console
  } else {
    log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status);
  }
}

function onLogin(user: Contact) {
  log.info('StarterBot', '%s login', user);
}

function onLogout(user: Contact) {
  log.info('StarterBot', '%s logout', user);
}

async function onMessage(msg: Message) {
  log.info('StarterBot', msg.toString());

  if (msg.text() === 'ding') {
    await msg.say('dong');
  }
}

const bot = WechatyBuilder.build({
  name: 'ding-dong-bot',
  puppet: 'wechaty-puppet-wechat',
  puppetOptions: {
    uos: true,
  },
});

bot.on('scan', onScan);
bot.on('login', onLogin);
bot.on('logout', onLogout);
bot.on('message', onMessage);

bot
  .start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch((e) => log.error('StarterBot', e));
