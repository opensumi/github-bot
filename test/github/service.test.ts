import { OctoService } from '@/github/service';
import { Octokit } from '@octokit/rest';

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
});
