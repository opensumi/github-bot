import {
  MONTHLY_REPORT_WORKFLOW,
  NEXT_WORKFLOW_FILE,
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
    const workflow = await this.octo.actions.createWorkflowDispatch({
      ...MONTHLY_REPORT_WORKFLOW,
    });
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
}
