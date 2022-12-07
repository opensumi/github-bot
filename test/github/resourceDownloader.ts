import { writeFile } from 'fs/promises';
import path from 'path';

import { Octokit } from '@octokit/rest';

import { OctoService } from '@/github/service';

const octo = new Octokit({
  auth: process.env['GITHUB_TOKEN'],
});
const service = new OctoService();
service.setOcto(octo);
async function main() {
  const targetDir = path.join(__dirname, '../fixtures');
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
