import { execa, execaCommand } from 'execa';
import { task } from 'hereby';

async function runTs(file) {
  await execa('tsx', [file]);
}

async function runTask(task) {
  await task.options.run();
}

async function shell(command) {
  await execaCommand(command, {
    stdio: 'inherit',
  });
}

export const buildNode = task({
  name: 'build:node',
  run: async () => {
    await runTs('build-node.ts');
  },
});

export const buildCfWorker = task({
  name: 'build:cfworker',
  run: async () => {
    await runTs('build-cfworker.ts');
  },
});

export const buildLibs = task({
  name: 'build:libs',
  run: async () => {
    await shell('lerna run build --stream');
  },
});

export const gen = task({
  name: 'gen',
  run: async () => {
    await shell('cfworker-builder gen-toml');
  },
});

export const tscBuild = task({
  name: 'tsc:build',
  dependencies: [buildLibs],
  run: async () => {
    await shell('tsc -p ./tsconfig.build.json --noEmit');
  },
});

export const build = task({
  name: 'build',
  dependencies: [tscBuild, gen],
  run: async () => {
    await runTask(buildNode);
    await runTask(buildCfWorker);
  },
});

export const dev = task({
  name: 'dev',
  run: async () => {
    await runTask(build);
  },
});

export default task({
  name: 'run npm script',
  run: async () => {
    if (process.env.npm_lifecycle_event === undefined) {
      throw new Error('No script specified');
    }

    await execa('hereby', [process.env.npm_lifecycle_event], {
      stdio: 'inherit',
    });
  },
});
