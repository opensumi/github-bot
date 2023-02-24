import axios, { AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const session = wrapper(
  axios.create({
    jar,
    proxy: {
      protocol: 'http',
      host: '127.0.0.1',
      port: 7890,
    },
  }),
);

class NewError extends Error {
  location: string;
  status_code: number;
  details: string;

  constructor(location: string, status_code: number, details: string) {
    super(details);
    this.location = location;
    this.status_code = status_code;
    this.details = details;
  }
}

export class Authenticator {
  session_token: string | null;
  email_address: string;
  password: string;
  proxy: string | null;
  access_token: string | null;
  user_agent: string;

  constructor(
    email_address: string,
    password: string,
    proxy: string | null = null,
  ) {
    this.session_token = null;
    this.email_address = email_address;
    this.password = password;
    this.proxy = proxy;

    this.access_token = null;
    this.user_agent =
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36';
  }
  async begin() {
    const url = 'https://explorer.api.openai.com/api/auth/csrf';
    const headers = {
      Host: 'explorer.api.openai.com',
      Accept: '*/*',
      Connection: 'keep-alive',
      'User-Agent': this.user_agent,
      'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
      Referer: 'https://explorer.api.openai.com/auth/login',
      'Accept-Encoding': 'gzip, deflate, br',
    };
    const response = await session.get(url, { headers, responseType: 'json' });
    if (response.status === 200) {
      const data = response.data;
      console.log(
        `🚀 ~ file: auth.ts:66 ~ Authenticator ~ begin ~ data:`,
        data,
      );
      const { csrfToken } = data;
      await this.part1(csrfToken);
    }
  }
  async part1(token: string) {
    const url =
      'https://explorer.api.openai.com/api/auth/signin/auth0?prompt=login';
    const payload = `callbackUrl=%2F&csrfToken=${token}&json=true`;
    const headers = {
      Host: 'explorer.api.openai.com',
      'User-Agent': this.user_agent,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: '*/*',
      'Sec-Gpc': '1',
      'Accept-Language': 'en-US,en;q=0.8',
      Origin: 'https://explorer.api.openai.com',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty',
      Referer: 'https://explorer.api.openai.com/auth/login',
      'Accept-Encoding': 'gzip, deflate',
    };
    const response = await session.post(url, payload, {
      headers,
      responseType: 'json',
    });
    if (response.status === 200) {
      const { url } = response.data;
      if (
        url ===
          'https://explorer.api.openai.com/api/auth/error?error=OAuthSignin' ||
        url.includes('error')
      ) {
        throw new NewError(
          'part1',
          response.status,
          url + 'You have been rate limited. Please try again later.',
        );
      }
      await this.part2(url);
    }
  }
  async part2(url: string) {
    const headers = {
      Host: 'auth0.openai.com',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      Connection: 'keep-alive',
      'User-Agent': this.user_agent,
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'https://explorer.api.openai.com/',
    };
    const response = await session.get(url, { headers });
    if (response.status === 200 || response.status === 302) {
      const { data } = response;
      console.log(
        `🚀 ~ file: auth.ts:124 ~ Authenticator ~ part2 ~ data:`,
        data,
      );
      let state = data.match(/state=(.*)/)[1];
      console.log(
        `🚀 ~ file: auth.ts:129 ~ Authenticator ~ part2 ~ state:`,
        state,
      );
      state = state.split('"')[0];
      // await this.part3(csrfToken);
    }
  }
}

async function main() {
  const auth = new Authenticator('xxx', 'xxx');
  await auth.begin();
}

main();
