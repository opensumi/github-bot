import {
  MONTHLY_REPORT_WORKFLOW,
  NEXT_WORKFLOW_FILE,
  PR_NEXT_RELEASE,
  PR_NEXT_WORKFLOW,
  RC_WORKFLOW_FILE,
} from '@/constants/opensumi';

import { OctoService } from '.';

export class OpenSumiOctoService extends OctoService {
  async releaseNextVersion(branch: string) {
    const workflow = await this.octo.actions.createWorkflowDispatch({
      owner: 'opensumi',
      repo: 'core',
      workflow_id: NEXT_WORKFLOW_FILE,
      ref: 'main',
      inputs: {
        ref: branch,
      },
    });
    return workflow;
  }

  async deployBot() {
    await this.octo.actions.createWorkflowDispatch({
      owner: 'opensumi',
      repo: 'github-bot',
      workflow_id: 'deploy.yml',
      ref: 'main',
      inputs: {
        environment: 'prod',
      },
    });
  }
  async deployBotPre() {
    await this.octo.actions.createWorkflowDispatch({
      owner: 'opensumi',
      repo: 'github-bot',
      workflow_id: 'deploy-pre.yml',
      ref: 'main',
    });
  }
  async releaseRCVersion(branch: string) {
    const workflow = await this.octo.actions.createWorkflowDispatch({
      owner: 'opensumi',
      repo: 'core',
      workflow_id: RC_WORKFLOW_FILE,
      ref: 'main',
      inputs: {
        ref: branch,
      },
    });
    return workflow;
  }
  async monthlyReport() {
    const workflow = await this.octo.actions.createWorkflowDispatch(
      MONTHLY_REPORT_WORKFLOW,
    );
    return workflow;
  }
  async syncVersion(version?: string) {
    const inputs = {} as Record<string, any>;
    if (version) {
      inputs.version = version;
    }
    const workflow = await this.octo.actions.createWorkflowDispatch({
      owner: 'opensumi',
      repo: 'actions',
      workflow_id: 'sync.yml',
      ref: 'main',
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
      ...MONTHLY_REPORT_WORKFLOW,
      inputs: {
        pull_number: pull_number.toString(),
        target_branch,
      },
    });
    return workflow;
  }

  async prNextRelease({ pull_number }: { pull_number: number }) {
    const workflow = await this.octo.actions.createWorkflowDispatch({
      ...PR_NEXT_WORKFLOW,
      inputs: {
        pull_number: pull_number.toString(),
      },
    });
    return workflow;
  }
}
