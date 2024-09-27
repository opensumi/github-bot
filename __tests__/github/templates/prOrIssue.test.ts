import { handleIssue, handlePr } from '@/github/templates/prOrIssue';

import {
  issue_opened_event,
  pull_request_2_0_opened,
  pull_request_2_3_closed,
  pull_request_2_13_opened,
  pull_request_edited_base,
  pull_request_edited_wip,
} from '../../fixtures';
import { ctx } from '../ctx';

describe('github templates pr or issue', () => {
  it('can handle pull_request_closed', async () => {
    const result = await handlePr(pull_request_2_3_closed, ctx);
    console.log(`pull_request_closed ~ result`, result);
    expect(result).toMatchSnapshot();
    expect(result.text).toBeDefined();
    expect(result.title).toBeDefined();
  });
  it('can handle pull_request_opened', async () => {
    const result = await handlePr(pull_request_2_0_opened, ctx);
    console.log(`pull_request_opened ~ result`, result.text);
    expect(result).toMatchSnapshot();
    expect(result.text).toBeDefined();
    expect(result.text).toContain('<-');
    expect(result.title).toBeDefined();
  });
  it('can handle pull_request_edit wip', async () => {
    const result = await handlePr(pull_request_edited_wip, ctx);
    console.log(`pull_request_edited_wip ~ result`, result.text);
    expect(result).toMatchSnapshot();
    expect(result.text).toBeDefined();
    expect(result.text).toContain('<-');
    expect(result.text).toContain('~~');
    expect(result.title).toBeDefined();
  });
  it('can handle pull_request_edited_base', async () => {
    const result = await handlePr(pull_request_edited_base, ctx);
    console.log(`pull_request_edited_base ~ result`, result.text);
    expect(result).toMatchSnapshot();
    expect(result.text).toBeDefined();
    expect(result.text).toContain('<-');
    expect(result.text).toContain('changed the base branch');
    expect(result.title).toBeDefined();
  });
  it('can handle issue', async () => {
    const result = await handleIssue(issue_opened_event, ctx);
    expect(result).toMatchSnapshot();
    expect(result.text).toBeDefined();
    expect(result.title).toBeDefined();
  });
  it('can handle pull_request_13_opened', async () => {
    const result = await handlePr(pull_request_2_13_opened, ctx);
    console.log(`pull_request_13_opened ~ result`, result.text);
    expect(result).toMatchSnapshot();
    expect(result.text).toBeDefined();
    expect(result.text).toContain('Requested reviewers');
    expect(result.title).toBeDefined();
  });
});
