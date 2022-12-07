import { handleRelease } from '@/github/templates';

import { release_published } from '../../fixtures';
import { ctx } from '../ctx';

describe('release related', () => {
  it('can handle release event', async () => {
    const data = await handleRelease(release_published, ctx);

    expect(data.title).toBeDefined();
    expect(data.text).toBeDefined();
  });
  it('will transform long url to short link', async () => {
    const data = await handleRelease(release_published, ctx);

    expect(data.title).toBeDefined();
    expect(data.text).toContain("[#1920](https://github.com/opensumi/core/pull/1920)");
  });
});