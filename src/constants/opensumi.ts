export namespace CoreRepo {
  export const NEXT_WORKFLOW_FILE = 'release-rc.yml';
}

export const VERSION_SYNC_KEYWORD = 'versionInfo';

export namespace ActionsRepo {
  const info = {
    owner: 'opensumi',
    repo: 'actions',
  };

  export const PR_NEXT_RELEASE_FILE = 'release-next.yml';
  export const PR_NEXT_WORKFLOW = {
    ...info,
    workflow_id: PR_NEXT_RELEASE_FILE,
    ref: 'main',
  };

  export const RELEASE_NEXT_BY_REF = 'release-next-by-ref.yml';
  export const RELEASE_NEXT_BY_REF_WORKFLOW = {
    ...info,
    workflow_id: RELEASE_NEXT_BY_REF,
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
