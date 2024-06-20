export const VERSION_SYNC_KEYWORD = 'versionInfo';

export const kBackportKeyword = 'backport';

export type RepoInfo = {
  owner: string;
  repo: string;
};

export namespace ActionsRepo {
  export const info = {
    owner: 'opensumi',
    repo: 'actions',
  };

  export const PR_NEXT_RELEASE_FILE = 'release-next.yml';
  export const PR_NEXT_WORKFLOW = {
    ...info,
    workflow_id: PR_NEXT_RELEASE_FILE,
    ref: 'main',
  };

  export const CODEBLITZ_PR_NEXT_RELEASE_FILE = 'codeblitz-release-next.yml';
  export const CODEBLITZ_PR_NEXT_WORKFLOW = {
    ...info,
    workflow_id: CODEBLITZ_PR_NEXT_RELEASE_FILE,
    ref: 'main',
  };

  export const RELEASE_NEXT_BY_REF = 'release-next-by-ref.yml';
  export const RELEASE_NEXT_BY_REF_WORKFLOW = {
    ...info,
    workflow_id: RELEASE_NEXT_BY_REF,
    ref: 'main',
  };

  export const CODEBLITZ_RELEASE_NEXT_BY_REF =
    'codeblitz-release-next-by-ref.yml';
  export const CODEBLITZ_RELEASE_NEXT_BY_REF_WORKFLOW = {
    ...info,
    workflow_id: CODEBLITZ_RELEASE_NEXT_BY_REF,
    ref: 'main',
  };

  export const BACKPORT_PR_FILE = 'backport-pr.yml';
  export const BACKPORT_PR_WORKFLOW = {
    ...info,
    workflow_id: BACKPORT_PR_FILE,
    ref: 'main',
  };

  export const MONTHLY_REPORT_FILE = 'monthly-report.yml';
  export const MONTHLY_REPORT_WORKFLOW = {
    ...info,
    workflow_id: MONTHLY_REPORT_FILE,
    ref: 'main',
  };

  export const SYNC_FILE = 'sync.yml';
  export const SYNC_WORKFLOW = {
    ...info,
    workflow_id: SYNC_FILE,
    ref: 'main',
  };

  export const SYNC_CODEBLITZ_FILE = 'codeblitz-sync.yml';
  export const SYNC_CODEBLITZ_WORKFLOW = {
    ...info,
    workflow_id: SYNC_CODEBLITZ_FILE,
    ref: 'main',
  };

  export const UPDATE_LOCKFILE_FILE = 'update-lockfile.yml';
  export const UPDATE_LOCKFILE_WORKFLOW = {
    ...info,
    workflow_id: UPDATE_LOCKFILE_FILE,
    ref: 'main',
  };
}

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
