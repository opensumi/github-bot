export const RC_WORKFLOW_FILE = 'release-rc.yml';

export const NEXT_WORKFLOW_FILE = 'release-rc.yml';

export const RELEASE_FILE = 'release-rc.yml';
export const PRE_RELEASE_FILE = 'pre-release.yml';
export const PR_NEXT_RELEASE = 'pr-next-release.yml';

export const workflowAboutRelease = new Set([
  'Pull Request Next Release',
  'Next Release Flow',
  'Release RC Version',
  'Release',
]);

export const VERSION_SYNC_KEYWORD = 'versionInfo';

export const MONTHLY_REPORT_FILE = 'monthly-report.yml';
export const PR_NEXT_RELEASE_FILE = 'release-next.yml';

export const MONTHLY_REPORT_WORKFLOW = {
  owner: 'opensumi',
  repo: 'actions',
  workflow_id: MONTHLY_REPORT_FILE,
  ref: 'main',
};

export const PR_NEXT_WORKFLOW = {
  owner: 'opensumi',
  repo: 'actions',
  workflow_id: PR_NEXT_RELEASE_FILE,
  ref: 'main',
};

export const BACKPORT_PR_FILE = 'backport-pr.yml';

export const BACKPORT_PR_WORKFLOW = {
  owner: 'opensumi',
  repo: 'actions',
  workflow_id: BACKPORT_PR_FILE,
  ref: 'main',
};

export function getActionsUrl({
  owner,
  repo,
  workflow_id,
}: {
  owner: string;
  repo: string;
  workflow_id: string;
}) {
  return `https://github.com/${owner}/${repo}/actions/workflows/${workflow_id}`;
}
