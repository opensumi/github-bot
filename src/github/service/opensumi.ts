import { CoreRepo, ActionsRepo } from '@/constants/opensumi';
import { GitHubService } from '@opensumi/octo-service';

import { firstLine } from '../renderer/line';

export class OpenSumiOctoService extends GitHubService {
  async releaseNextVersion(branch: string, workflowRef = 'main') {
    const workflow = await this.octo.actions.createWorkflowDispatch({
      owner: 'opensumi',
      repo: 'core',
      workflow_id: ActionsRepo.RELEASE_NEXT_BY_REF,
      ref: workflowRef,
      inputs: {
        ref: branch,
      },
    });
    return workflow;
  }

  async getLastNCommitsText(options: {
    owner: string;
    repo: string;
    ref?: string;
    /**
     * @default 5
     */
    n?: number;
  }) {
    const { owner, repo, ref, n = 5 } = options;

    const { data } = await this.octo.repos.listCommits({
      owner,
      repo,
      sha: ref,
      per_page: n,
    });

    const commits = data.map((c) => {
      return {
        sha: c.sha,
        message: c.commit.message,
        url: c.html_url,
      };
    });
    const text = commits
      .map((c) => {
        return `- [${c.sha.slice(0, 7)}](${c.url}) ${firstLine(c.message)}`;
      })
      .join('\n');
    return text;
  }

  async deployBot(workflowRef = 'main') {
    await this.octo.actions.createWorkflowDispatch({
      owner: 'opensumi',
      repo: 'github-bot',
      workflow_id: 'deploy.yml',
      ref: workflowRef,
      inputs: {
        environment: 'prod',
      },
    });
  }
  async deployBotPre(workflowRef = 'main') {
    await this.octo.actions.createWorkflowDispatch({
      owner: 'opensumi',
      repo: 'github-bot',
      workflow_id: 'deploy-pre.yml',
      ref: workflowRef,
    });
  }

  async monthlyReport(inputs: { time?: string }) {
    const workflow = await this.octo.actions.createWorkflowDispatch({
      ...ActionsRepo.MONTHLY_REPORT_WORKFLOW,
      inputs,
    });
    return workflow;
  }
  async syncVersion(version?: string, workflowRef = 'main') {
    const inputs = {} as Record<string, any>;
    if (version) {
      inputs.version = version;
    }
    const workflow = await this.octo.actions.createWorkflowDispatch({
      owner: 'opensumi',
      repo: 'actions',
      workflow_id: 'sync.yml',
      ref: workflowRef,
      inputs,
    });
    return workflow;
  }

  async backportPr({
    pull_number,
    target_branch,
  }: {
    pull_number: number;
    target_branch: string;
  }) {
    const workflow = await this.octo.actions.createWorkflowDispatch({
      ...ActionsRepo.BACKPORT_PR_WORKFLOW,
      inputs: {
        pull_number: pull_number.toString(),
        target_branch,
      },
    });
    return workflow;
  }

  async prNextRelease({ pull_number }: { pull_number: number }) {
    const workflow = await this.octo.actions.createWorkflowDispatch({
      ...ActionsRepo.PR_NEXT_WORKFLOW,
      inputs: {
        pull_number: pull_number.toString(),
      },
    });
    return workflow;
  }
}
