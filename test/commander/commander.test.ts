import { CommandCenter } from '@/commander';
import { ISSUE_REGEX } from '@/ding/commands/constants';

describe('command center', () => {
  it('can resolve text', async () => {
    const fn = jest.fn();
    const cc = new CommandCenter([''], (v) => {
      v.on('hello', fn);
    });
    const result = await cc.resolve('hello');
    expect(result).toBeDefined();
    result?.handler();
    expect(fn).toBeCalled();
    const notExists = await cc.resolve('something');
    expect(notExists).not.toBeUndefined();
  });
  it('can resolve regex', async () => {
    const fn = jest.fn();
    const cc = new CommandCenter([''], (v) => {
      v.on(ISSUE_REGEX, fn);
    });
    const result = await cc.resolve('#84');
    expect(result).toBeDefined();
    result?.handler();
    expect(fn).toBeCalled();
    const notExists = await cc.resolve('something');
    expect(notExists).not.toBeUndefined();
  });
});
