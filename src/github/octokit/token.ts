import ky from 'ky';

export async function checkTokenValid(token: string) {
  const response = await ky('https://api.github.com/users/bytemain', {
    headers: {
      Authorization: `token ${token}`,
    },
    throwHttpErrors: false,
  });
  console.log('check token valid:', response.status);
  return response.status !== 401;
}
