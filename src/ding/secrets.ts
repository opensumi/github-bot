export interface IDingBotSetting {
  outGoingToken: string;
}

const SECRETS_PREFIX = 'ding/secrets/';
const INFO_PREFIX = 'ding/info/';

export const getSettingById = async (id: string) => {
  const webhooks = await WEBHOOKS_INFO.get<IDingBotSetting>(
    SECRETS_PREFIX + id,
    'json',
  );
  return webhooks;
};

export interface DingInfo {
  defaultRepo?: string;
}

export const getGroupInfo = async (id: string) => {
  return await WEBHOOKS_INFO.get<DingInfo>(INFO_PREFIX + id, 'json');
};

export const setGroupInfo = async (id: string, info: DingInfo) => {
  return await WEBHOOKS_INFO.put(INFO_PREFIX + id, JSON.stringify(info));
};

export const updateGroupInfo = async (id: string, info: Partial<DingInfo>) => {
  const oldInfo = (await getGroupInfo(id)) ?? {};
  const newInfo = Object.assign({}, oldInfo, info);
  return await WEBHOOKS_INFO.put(INFO_PREFIX + id, JSON.stringify(newInfo));
};

export const getDefaultRepo = async (id: string) => {
  const info = await getGroupInfo(id);
  if (info?.defaultRepo) {
    const data = info.defaultRepo.split('/');
    return {
      owner: data[0],
      repo: data[1],
    };
  }
  return undefined;
};
