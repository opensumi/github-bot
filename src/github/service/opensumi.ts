import { ActionsRepo } from '@/constants/opensumi';
import { GitHubService } from '@opensumi/octo-service';

import { firstLine } from '../renderer/line';

export class OpenSumiOctoService extends GitHubService {
  async releaseNextVersion(
    workflowInfo: {
      workflow_id: string;
      ref: string;
      owner: string;
      repo: string;
    },
    branch: string,
    workflowRef = 'main',
  ) {
    const workflow = await this.octo.actions.createWorkflowDispatch({
      ...workflowInfo,
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
  async syncOpenSumiVersion(version?: string, workflowRef = 'main') {
    const inputs = {} as Record<string, any>;
    if (version) {
      inputs.version = version;
    }

    const _workflow = {
      ...ActionsRepo.SYNC_WORKFLOW,
    };

    if (workflowRef) {
      _workflow.ref = workflowRef;
    }

    const workflow = await this.octo.actions.createWorkflowDispatch({
      ..._workflow,
      inputs,
    });
    return workflow;
  }

  async syncCodeblitzVersion(version?: string, workflowRef = 'main') {
    const inputs = {} as Record<string, any>;
    if (version) {
      inputs.version = version;
    }

    const _workflow = {
      ...ActionsRepo.SYNC_CODEBLITZ_WORKFLOW,
    };

    if (workflowRef) {
      _workflow.ref = workflowRef;
    }

    const workflow = await this.octo.actions.createWorkflowDispatch({
      ..._workflow,
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

  async prNextRelease({
    pull_number,
    fullname,
  }: {
    pull_number: number;
    fullname: string;
  }) {
    let workflowInfo: any;

    switch (fullname) {
      case 'opensumi/core':
        workflowInfo = ActionsRepo.PR_NEXT_WORKFLOW;
        break;
      case 'opensumi/codeblitz':
        workflowInfo = ActionsRepo.CODEBLITZ_PR_NEXT_WORKFLOW;
        break;
    }

    const workflow = await this.octo.actions.createWorkflowDispatch({
      ...workflowInfo,
      inputs: {
        pull_number: pull_number.toString(),
      },
    });
    return workflow;
  }

  async updateLockfileForPr({ pull_number }: { pull_number: number }) {
    const workflow = await this.octo.actions.createWorkflowDispatch({
      ...ActionsRepo.UPDATE_LOCKFILE_WORKFLOW,
      inputs: {
        pull_number: pull_number.toString(),
      },
    });
    return workflow;
  }

  async createMergeCommitForPr({ pull_number }: { pull_number: number }) {
    const workflow = await this.octo.actions.createWorkflowDispatch({
      ...ActionsRepo.CREATE_MERGE_COMMIT_WORKFLOW,
      inputs: {
        pull_number: pull_number.toString(),
      },
    });
    return workflow;
  }
}
