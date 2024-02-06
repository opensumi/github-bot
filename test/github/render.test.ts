import { render, renderTemplate } from '@/github/render';

import { issue2045, pr2060 } from '../fixtures';

describe('render', () => {
  it('can render pr', () => {
    const d = render(pr2060);
    expect(d).toMatchSnapshot();
    console.log(d);
  });
  it('can render issue', () => {
    const d = render(issue2045);
    expect(d).toMatchSnapshot();
  });

  it('can render template', () => {
    debugger;
    const a = renderTemplate('hello {{sender}}', {
      sender: 'henry',
    });
    expect(a).toBe('hello henry');
  });
  it('can render template with operator', () => {
    debugger;
    const b = renderTemplate('hello {{sender|link}}', {
      sender: { login: 'henry', html_url: 'https://bot.internal' },
    });
    expect(b).toBe('hello [henry](https://bot.internal)');
  });
});
