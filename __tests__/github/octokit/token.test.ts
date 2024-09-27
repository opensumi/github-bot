export async function checkTokenValid(token: string) {
  const response = await fetch('https://api.github.com/users/bytemain', {
    headers: {
      Authorization: `token ${token}`,
    },
  });
  console.log('check token valid:', response.status);
  return response.status !== 401;
}

describe.skip('octokit token related', () => {
  it('can check bad credential', async () => {
    const result = await checkTokenValid('bad token');
    expect(result).toBeFalsy();
    console.log(`🚀 ~ file: token.test.ts:6 ~ it ~ result:`, result);
  });
});
