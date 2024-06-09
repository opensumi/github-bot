import Commander from './commander/index.mjs';
import { run, watch } from './gen-toml.mjs';

const commander = new Commander();
commander.addSubCommand('gen-toml', {
  handler: (_, argv) => {
    console.log(_);
    console.log(argv);
    run();
    if (argv.watch) {
      watch();
    }
  },
  help: 'generate wrangler.toml',
});

commander.run();
