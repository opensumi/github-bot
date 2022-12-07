import { render } from '@/github/render';

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
});
