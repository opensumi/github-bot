module.exports = {
  apps: [
    {
      script: './dist/node',
      watch: './dist/node',
      instances: '3',
      exec_mode: 'cluster',
    },
  ],
};
