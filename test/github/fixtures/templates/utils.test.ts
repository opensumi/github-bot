import { detailTitleTpl } from '@/github/templates/utils';

describe('github templates utils', () => {
  it('detail title example1', () => {
    const detail = detailTitleTpl(
      {
        somebody: {
          login: 'somebody',
          html_url: '',
        },
        did: {
          text: 'requested',
          html_url: '',
        },
        something: 'changes',
        something1: {
          text: 'pull request',
          html_url: '',
        },
      },
      undefined as any,
    );
    expect(detail).toBe(
      '[somebody]() [requested]() changes on [pull request]()',
    );
  });

  it('detail title example2', () => {
    const detail = detailTitleTpl(
      {
        somebody: {
          login: 'somebody',
          html_url: '',
        },
        did: {
          text: 'approved',
          html_url: '',
        },
        something: undefined,
        something1: {
          text: 'pull request',
          html_url: '',
        },
      },
      undefined as any,
    );
    expect(detail).toBe('[somebody]() [approved]() [pull request]()');
  });
});
