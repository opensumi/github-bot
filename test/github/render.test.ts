import { renderPrOrIssue, render } from '@/github/render';

import { issue2045, pr2060 } from '../fixtures';

describe('render', () => {
  it('can render pr', () => {
    const d = renderPrOrIssue(pr2060);
    expect(d).toMatchSnapshot();
    console.log(d);
  });
  it('can render issue', () => {
    const d = renderPrOrIssue(issue2045);
    expect(d).toMatchSnapshot();
  });

  it('can render template', () => {
    debugger;
    const a = render('hello {{sender}}', {
      sender: 'henry',
    });
    expect(a).toBe('hello henry');
  });
  it('can render template with operator', () => {
    debugger;
    const b = render('hello {{sender|link}}', {
      sender: { login: 'henry', html_url: 'https://bot.internal' },
    });
    expect(b).toBe('hello [henry](https://bot.internal)');
  });
});
