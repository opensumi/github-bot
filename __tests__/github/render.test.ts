import { render, renderPrOrIssue } from '@/services/github/renderer';

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
    const a = render('hello {{sender}}', {
      sender: 'henry',
    });
    expect(a).toBe('hello henry');
  });
  it('can render template with operator', () => {
    const b = render('hello {{sender|link}}', {
      sender: { login: 'henry', html_url: 'https://bot.internal' },
    });
    expect(b).toBe('hello [henry](https://bot.internal)');

    const h4 = render('{{title|h4}}', {
      title: 'hello',
    });
    expect(h4).toBe('#### hello');
  });

  it('can render nested placeholder', () => {
    const a = '{{milestone|ref}}';
    const milestone = '{{title|ref}}';
    const title = `123\n456\n789`;
    expect(render(a, { milestone, title })).toMatchSnapshot();
  });
});
