import {
  limitLine,
  useRef,
  limitTextByPostion,
} from '@/github/templates/utils';
import exp from 'constants';
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
22222
33333
44444
`;
    const d = limitTextByPostion(text, 9);
    expect(d).toEqual(`11111\n22222`);
  });
});
