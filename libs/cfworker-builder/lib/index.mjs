import Commander from './commander/index.mjs';

const commander = new Commander();
commander.addSubCommand('gen-toml', {
  handler: (_, argv) => {
    console.log(_);
    console.log(argv);
    import('./gen-toml.mjs');
  },
  help: 'generate wrangler.toml',
});

commander.run();
