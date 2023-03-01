module.exports = {
  apps: [
    {
      script: './dist/node',
      watch: './dist/node',
      instances : "10",
      exec_mode : "cluster"
    },
  ],
};
