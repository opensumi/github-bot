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

export const MONTHLY_REPORT_WORKFLOW = {
  owner: 'opensumi',
  repo: 'actions',
  workflow_id: MONTHLY_REPORT_FILE,
  ref: 'main',
};
