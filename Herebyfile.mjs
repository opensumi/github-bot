import { execa, execaCommand } from 'execa';
import { task } from 'hereby';

async function tsx(file, ...args) {
  await execa('tsx', [file, ...args]);
}

async function runTask(task, ...args) {
  console.log(`[RUN] Starting ${task.options.name}`, ...args);
  await task.options.run(...args);
  console.log(`[RUN] Finished ${task.options.name}`);
}

async function shell(command) {
  console.log(`[RUN] ${command}`);
  await execaCommand(command, {
    stdio: 'inherit',
  });
}

export const buildNode = task({
  name: 'build:node',
  run: async (...args) => {
    await tsx('build-node.ts', ...args);
  },
});

export const buildCfWorker = task({
  name: 'build:cfworker',
  run: async (...args) => {
    await tsx('build-cfworker.ts', ...args);
  },
});

export const buildLibs = task({
  name: 'build:libs',
  run: async () => {
    await shell('lerna run build --stream');
  },
});

export const watchLibs = task({
  name: 'watch:libs',
  run: async () => {
    await shell('lerna run watch --stream');
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
  dependencies: [build],
  run: async () => {
    await runTask(devNode);
  },
});

export const watch = task({
  name: 'watch',
  dependencies: [build],
  run: async () => {
    await Promise.all([
      runTask(buildCfWorker, '--watch'),
      runTask(buildNode, '--watch'),
    ]);
  },
});

export const devNode = task({
  name: 'dev:node',
  run: async () => {
    await Promise.all([runTask(watch), shell('nodemon ./dist/node')]);
  },
});

export const devNodeDebug = task({
  name: 'dev:node:debug',
  run: async () => {
    await shell('nodemon --inspect --inspect-brk ./dist/node');
  },
});

export const devWorker = task({
  name: 'dev:worker',
  run: async () => {
    await shell('wrangler dev');
  },
});

export const devProxy = task({
  name: 'dev:proxy',
  run: async () => {
    await tsx('dev.ts');
  },
});

export const devWorkerPreview = task({
  name: 'dev:worker:preview',
  run: async () => {
    await Promise.all([runTask(devWorker), runTask(devProxy)]);
  },
});

export default task({
  name: 'npm script',
  hiddenFromTaskList: true,
  run: async () => {
    if (process.env.npm_lifecycle_event === undefined) {
      throw new Error('No script specified');
    }

    await execa('hereby', [process.env.npm_lifecycle_event], {
      stdio: 'inherit',
    });
  },
});
