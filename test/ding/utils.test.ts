import { CommandCenter } from '@/commander';

const cc = new CommandCenter();

describe('utils', () => {
  it('can parse cli args', () => {
    const command = 'rc v2.18';
    const data = cc.parseCliArgs(command);
    console.log(`file: utils.test.ts ~ line 7 ~ it ~ data`, data);
    expect(data._[0]).toBe('rc');
  });

  it('can ignore more space on args', () => {
    const command = 'rc   v2.18';
    const data = cc.parseCliArgs(command);
    console.log(`file: utils.test.ts ~ line 7 ~ it ~ data`, data);
    expect(data._[1]).toBe('v2.18');
  });
});
