export default [
  // --- Dingtalk related
  // You should select **signed mode(加签模式)** in the security settings of the bot. and you will see this secret.
  'DINGTALK_SECRET',
  // Webhook for the dingtalk bot
  'DINGTALK_WEBHOOK_URL',
  // The POST mode `outgoing` token.
  'DINGTALK_OUTGOING_TOKEN',

  // --- GitHub Webhook related
  // The secret you should set in GitHub Webhook Settings.
  'GH_WEBHOOK_SECRET',

  // --- GitHub App related
  // The appId of your GitHub App.
  'GH_APP_ID',
  // The secret you set in GitHub App Settings.
  'GH_APP_WEBHOOK_SECRET',
  // Generate a private key in GitHub App Settings.
  'GH_APP_PRIVATE_KEY',
];
