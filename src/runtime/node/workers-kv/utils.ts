export const ERROR_PREFIX = 'workers-kv';

export const workersKvDebug = (...args: any[]) => {
  console.debug('[WorkersKV] ', ...args);
};

export const getAuthHeaders = (
  cfEmail?: string,
  cfAuthKey?: string,
  cfAuthToken?: string,
): Record<string, string> => {
  if (cfAuthToken) {
    return { Authorization: `Bearer ${cfAuthToken}` };
  }

  if (cfEmail && cfAuthKey) {
    return { 'X-Auth-Email': cfEmail, 'X-Auth-Key': cfAuthKey };
  }

  throw new Error(
    `${ERROR_PREFIX}: Either cfAuthToken or cfEmail and cfAuthKey must be provided`,
  );
};
