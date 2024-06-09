import { writeFile } from 'fs/promises';
import path from 'path';

import { Octokit } from '@octokit/rest';

import { GitHubService } from '@opensumi/octo-service';

const octo = new Octokit({
  auth: process.env['GITHUB_TOKEN'],
});
const service = new GitHubService();
service.octo = octo;
async function main() {
  const targetDir = path.join(__dirname, '../__tests__/fixtures');
  const issueData = await service.getIssuePrByNumber('opensumi', 'core', 2045);
  await writeFile(
    path.join(targetDir, './issue-2045.json'),
    JSON.stringify(issueData, null, 2),
  );
  const prData = await service.getIssuePrByNumber('opensumi', 'core', 2060);
  await writeFile(
    path.join(targetDir, './pr-2060.json'),
    JSON.stringify(prData, null, 2),
  );
}

main();
