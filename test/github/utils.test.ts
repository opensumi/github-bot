import * as DingUtils from '@/ding/utils';
import {
  limitLine,
  useRef,
  limitTextByPosition,
} from '@/github/templates/utils';
import {
  sendToDing,
  replaceGitHubUrlToMarkdown,
  replaceGitHubText,
} from '@/github/utils';

describe('github utils', () => {
  it('can limit lines', () => {
    const text = `line1\nline2\nline3\n`;
    const text1 = limitLine(text, 1);
    expect(text1).toEqual('line1');
  });

  it('can ref comments', () => {
    const comment = `<img width="954" alt="image" src="https://user-images.githubusercontent.com/2226423/153811718-2babbfa7-e63f-4ec7-9fd3-9f450beaad9b.png">
看起来这个分支有个报错关于 TerminalClient 的,有可能是 init 时机有点问题`;
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
  it('can transform github related urls', () => {
    const demoText = `<!-- Release notes generated using configuration in .github/release.yml at v2.21.2 -->

## What's Changed

* fix(snippets): register code snippets timing by @Aaaaash in https://github.com/opensumi/core/pull/1920
* fix: workspace dir async watch by @Aaaaash in https://github.com/opensumi/core/pull/1929
* fix: support mousewheel on editor tabs by @erha19 in https://github.com/opensumi/core/pull/1927
* fix: do not active disabled extension by @Aaaaash in https://github.com/opensumi/core/pull/1931
* fix: make watcher can be disposed by @opensumi in https://github.com/opensumi/core/pull/1925
* fix: browser views contribution by @Aaaaash in https://github.com/opensumi/core/pull/1921
* fix: parcel watcher subscribe retry catch by @life2015 in https://github.com/opensumi/core/pull/1932
* fix: update unsupported watch exclude glob by @erha19 in https://github.com/opensumi/core/pull/1926
* chore(release): v2.20.12 by @erha19 in https://github.com/opensumi/core/pull/1938
* fix: make the search references clean up by @yantze in https://github.com/opensumi/core/pull/1923

**Full Changelog**: https://github.com/opensumi/core/compare/v2.21.1...v2.21.2`;
    const data = replaceGitHubUrlToMarkdown(demoText, {
      repo: 'core',
      owner: 'opensumi',
    });
    expect(data).toContain(
      '[#1932](https://github.com/opensumi/core/pull/1932)',
    );
    expect(data).toContain(
      '[v2.21.1...v2.21.2](https://github.com/opensumi/core/compare/v2.21.1...v2.21.2)',
    );
    console.log(`🚀 ~ file: utils.test.ts ~ line 108 ~ it ~ data`, data);
  });

  it('can transform github text content image', () => {
    const msg = `但是不加这个引号的话，我的 zsh 会报错。
    <img width="470" alt="CleanShot 2022-12-07 at 14 40 03@2x" src="https://user-images.githubusercontent.com/13938334/206107044-9f1ba8ba-9398-44da-8de8-872f600b59d5.png">
    改成  "watch": "run-p \"watch:*\"" 试下呢？`;
    const result = replaceGitHubText(msg);
    expect(result).toEqual(`但是不加这个引号的话，我的 zsh 会报错。
    ![](https://user-images.githubusercontent.com/13938334/206107044-9f1ba8ba-9398-44da-8de8-872f600b59d5.png)
    改成  "watch": "run-p \"watch:*\"" 试下呢？`);
  });
  it('can transform github text content only message', () => {
    const msg = `<img width="474" alt="image" src="https://user-images.githubusercontent.com/2226423/206106339-a997fe20-06ff-4e70-b8cd-2a3c4ac475a3.png">`;
    const result = replaceGitHubText(msg);
    expect(result).toEqual(
      `![](https://user-images.githubusercontent.com/2226423/206106339-a997fe20-06ff-4e70-b8cd-2a3c4ac475a3.png)`,
    );
  });
  it('can transform github text content has multiple image', () => {
    const msg = `但是不加这个引号的话，我的 zsh 会报错。
    <img width="470" alt="CleanShot 2022-12-07 at 14 40 03@2x" src="https://user-images.githubusercontent.com/13938334/206107044-9f1ba8ba-9398-44da-8de8-872f600b59d5.png">
    <img width="474" alt="image" src="https://user-images.githubusercontent.com/2226423/206106339-a997fe20-06ff-4e70-b8cd-2a3c4ac475a3.png">
    改成  "watch": "run-p \"watch:*\"" 试下呢？`;
    const result = replaceGitHubText(msg);
    expect(result).toEqual(`但是不加这个引号的话，我的 zsh 会报错。
    ![](https://user-images.githubusercontent.com/13938334/206107044-9f1ba8ba-9398-44da-8de8-872f600b59d5.png)
    ![](https://user-images.githubusercontent.com/2226423/206106339-a997fe20-06ff-4e70-b8cd-2a3c4ac475a3.png)
    改成  "watch": "run-p \"watch:*\"" 试下呢？`);
  });
});
