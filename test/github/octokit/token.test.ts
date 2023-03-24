import { checkTokenValid } from '@/github/octokit/token';

describe('octokit token related', () => {
  it('can check bad credential', async () => {
    const result = await checkTokenValid('bad token');
    expect(result).toBeFalsy();
    console.log(`🚀 ~ file: token.test.ts:6 ~ it ~ result:`, result);
  });
});
