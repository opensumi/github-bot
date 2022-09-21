import {
  limitLine,
  useRef,
  limitTextByPosition,
} from '@/github/templates/utils';
import { sendToDing } from '@/github/utils';
import * as DingUtils from '@/ding/utils';

describe('github utils', () => {
  it('can limit lines', () => {
    const text = `line1\nline2\nline3\n`;
    const text1 = limitLine(text, 1);
    expect(text1).toEqual('line1');
  });

  it('can ref comments', () => {
    const comment =
      '<img width="954" alt="image" src="https://user-images.githubusercontent.com/2226423/153811718-2babbfa7-e63f-4ec7-9fd3-9f450beaad9b.png">\r\n看起来这个分支有个报错关于 TerminalClient 的,有可能是 init 时机有点问题';
    const data = useRef(comment);
    console.log(`🚀 ~ file: utils.test.ts ~ line 12 ~ it ~ data`, data);
  });

  it('can limitTextByPostion', () => {
    const text = `11111
22222`;
    const d = limitTextByPosition(text, 100);
    expect(d).toEqual(`11111\n22222`);
  });

  it('can limitTextByPostion', () => {
    const text = `11111
22222
33333
44444
`;
    const d = limitTextByPosition(text, 9);
    expect(d).toEqual(`11111\n22222\n33333...`);
  });

  it('can limitTextByPostion2', () => {
    const text = `11111
22222
33333
44444
55555
66666
77777
`;
    const d = limitTextByPosition(text, 15);
    expect(d).toEqual(`11111\n22222\n33333...`);
  });

  it('send to ding', async () => {
    const md = {
      title: '123',
      text: '123123',
    };

    const urls = [] as string[];
    jest
      .spyOn(DingUtils, 'send')
      .mockImplementation(async (content, url, secret): Promise<any> => {
        urls.push(url);
      });

    await sendToDing(md, 'release.released', {
      githubSecret: '123',
      contentLimit: 300,
      dingWebhooks: [
        {
          secret: '1',
          url: '1',
        },
        {
          secret: '2',
          url: '2',
          event: ['release.released'],
        },
      ],
    });
    console.log(urls);
    expect(urls.length).toEqual(2);

    await sendToDing(md, 'check_run', {
      githubSecret: '123',
      contentLimit: 300,
      dingWebhooks: [
        {
          secret: '1',
          url: '1',
        },
        {
          secret: '2',
          url: '2',
          event: ['release.released'],
        },
      ],
    });
    expect(urls.length).toEqual(3);
  });
});
