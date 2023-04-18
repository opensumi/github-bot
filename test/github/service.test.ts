import 'dotenv/config';

import { Octokit } from '@octokit/rest';

import { OctoService } from '@/github/service';

const shouldSkip = !Boolean(process.env['GITHUB_TOKEN']);
console.log(`🚀 ~ file: service.test.ts ~ line 5 ~ shouldSkip`, shouldSkip);

(shouldSkip ? describe.skip : describe)('can fetch github data', () => {
  const octo = new Octokit({
    auth: process.env['GITHUB_TOKEN'],
  });
  const service = new OctoService();
  service.setOcto(octo);

  it('can fetch history', async () => {
    jest.setTimeout(9999999999);

    const data = await service.getRepoHistory('opensumi', 'core');
    console.log(`🚀 ~ file: service.test.ts ~ line 15 ~ it ~ data`, data);
  });
  it('can get pr info', async () => {
    jest.setTimeout(9999999999);
    const result = await service.getPrByNumber('opensumi', 'core', 2463);
    console.log(`🚀 ~ file: service.test.ts:33 ~ it ~ result:`, result);
  });
  it('can get patch', async () => {
    jest.setTimeout(9999999999);
    const { data: patch } = await octo.pulls.get({
      owner: 'opensumi',
      repo: 'core',
      pull_number: 2395,
      mediaType: {
        format: 'patch',
      },
    });
    console.log(`🚀 ~ file: service.test.ts:33 ~ it ~ patch:`, patch);
  });
  it('can get diff', async () => {
    jest.setTimeout(9999999999);
    const { data: diff } = await octo.pulls.get({
      owner: 'opensumi',
      repo: 'core',
      pull_number: 2394,
      mediaType: {
        format: 'diff',
      },
    });
    console.log(typeof diff);

    console.log(`🚀 ~ file: service.test.ts:33 ~ it ~ diff:`, diff);
  });
  it('can auth', async () => {
    try {
      const result = await octo.request('GET /users/bytemain');
      console.log(`🚀 ~ file: service.test.ts:56 ~ it ~ result:`, result);
    } catch (error) {
      debugger;
      console.log(error);
    }
  });

  it('can trigger workflow', async () => {
    try {
      const result = await octo.actions.createWorkflowDispatch({
        owner: 'opensumi',
        repo: 'core',
        workflow_id: 'manual-release-rc.yml',
        ref: 'alipay/v2.20',
        inputs: {
          ref: 'alipay/v2.20',
        },
      });
      console.log(`🚀 ~ file: service.test.ts:56 ~ it ~ result:`, result);
    } catch (error) {
      debugger;
      console.log(error);
    }
  });
});
