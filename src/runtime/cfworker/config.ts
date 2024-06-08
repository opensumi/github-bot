import { IRuntimeConfig } from '../base';

export const runtimeConfig: IRuntimeConfig = {
  // cloudflare worker 会在 30s 后强制结束 worker，所以这里设置 29s 的超时
  defaultTimeout: 29 * 1000,
};
