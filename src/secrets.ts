// 在 github app 的设置页面中查看
// 如：https://github.com/organizations/riril/settings/apps/ririltestbot
let appId = '';
let webhookSecret = '';
let privateKey = '';

let clientId = '';
let clientSecret = '';

let dingtalkOutGoingToken = '';
let dingtalkWebhookUrl = '';
let dingtalkSecret = '';

let ghWebhookSecret = '';

try {
  appId = GH_APP_ID;
  webhookSecret = GH_APP_WEBHOOK_SECRET;
  privateKey = GH_APP_PRIVATE_KEY;

  clientId = GH_APP_CLIENT_ID;
  clientSecret = GH_APP_CLIENT_SECRET;

  dingtalkOutGoingToken = DINGTALK_OUTGOING_TOKEN;
  dingtalkWebhookUrl = DINGTALK_WEBHOOK_URL;
  dingtalkSecret = DINGTALK_SECRET;

  ghWebhookSecret = GH_WEBHOOK_SECRET;
} catch (error) {
  console.error(error);
}

export default {
  appId,
  webhookSecret,
  clientId,
  clientSecret,
  privateKey,
  dingtalkOutGoingToken,
  dingtalkWebhookUrl,
  dingtalkSecret,
  ghWebhookSecret,
};
