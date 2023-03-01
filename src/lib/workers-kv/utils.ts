import https from 'https';
import querystring from 'querystring';

import { IBaseInputs } from './types';

const workersKvDebug = (...args: any[]) => {
  console.debug('WorkersKV: ', ...args);
};

export const MAX_KEYS_LIMIT = 1000;
export const MIN_KEYS_LIMIT = 10;
export const MAX_KEY_LENGTH = 512;
export const MAX_VALUE_LENGTH = 10 * 1024 * 1024;
export const MIN_EXPIRATION_TTL_SECONDS = 60;
export const MAX_MULTIPLE_KEYS_LENGTH = 10000;
export const ERROR_PREFIX = 'workers-kv';

export const httpsAgent = new https.Agent({ keepAlive: true });

export const httpsReq = (options: Record<string, any>, reqBody = '') =>
  new Promise<{
    type: 'stream' | 'text' | 'json';
    data: any;
    success: boolean;
  }>((resolve, reject) => {
    options.agent = httpsAgent;
    const req = https.request(options, (res) => {
      const { headers, statusCode } = res;
      workersKvDebug({ status: res.statusCode, headers });
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () =>
        responseBodyResolver(resolve)(statusCode, headers, data),
      );
    });
    req.on('error', (e) => reject(e));
    !!reqBody && req.write(reqBody);
    req.end();
  });

export const responseBodyResolver =
  (
    resolve: (data: {
      type: 'stream' | 'text' | 'json';
      data: any;
      success: boolean;
    }) => void,
  ) =>
  (statusCode: number | undefined, headers: Record<string, any>, data: any) => {
    const success = Boolean(statusCode && statusCode === 200);
    const contentType = headers['content-type'];
    if (contentType.includes('text/plain')) {
      resolve({
        type: 'text',
        success,
        data,
      });
    } else if (contentType.includes('application/json')) {
      resolve({
        type: 'json',
        success,
        data: JSON.parse(data),
      });
    } else if (contentType.includes('application/octet-stream')) {
      resolve({
        type: 'stream',
        success,
        data: data,
      });
    } else {
      throw new Error(
        `${ERROR_PREFIX} only JSON, octet-stream or plain text content types are expected. Received content-type: ${contentType}.`,
      );
    }
  };

export const removeUndefined = (obj: Record<string, any>) =>
  JSON.parse(JSON.stringify(obj));

export const getQueryString = (obj: Record<string, any>) =>
  querystring.stringify(removeUndefined(obj));

export const getPathWithQueryString = (path: string, qs: string) =>
  path + (qs ? `?${qs}` : '');

export const checkLimit = (limit: number) => {
  if (limit < MIN_KEYS_LIMIT || limit > MAX_KEYS_LIMIT) {
    throw new Error(
      `${ERROR_PREFIX}: limit should be between ${MIN_KEYS_LIMIT} and ${MAX_KEYS_LIMIT}. Given limit: ${limit}.`,
    );
  }
};

export const isString = (x: string) =>
  typeof x === 'string' ||
  (x && Object.prototype.toString.call(x) === '[object String]');

export const checkKey = (key: string) => {
  if (!key || !isString(key) || key.length > MAX_KEY_LENGTH) {
    throw new Error(
      `${ERROR_PREFIX}: Key length should be less than ${MAX_KEY_LENGTH}. `,
    );
  }
};

export const checkKeyValue = (key: string, value: any) => {
  checkKey(key);
  if (!value || !isString(value) || value.length > MAX_VALUE_LENGTH) {
    throw new Error(
      `${ERROR_PREFIX}: Value length should be less than ${MAX_VALUE_LENGTH}.`,
    );
  }
};

export const checkMultipleKeysLength = (method: string, length: number) => {
  if (length > MAX_MULTIPLE_KEYS_LENGTH) {
    throw new Error(
      `${ERROR_PREFIX}: method ${method} must be provided a container with at most ${MAX_MULTIPLE_KEYS_LENGTH} items.`,
    );
  }
};

export const checkKeyValueMap = (keyValueMap: Record<string, any>) => {
  const entries = keyValueMap ? Object.entries(keyValueMap) : [];
  if (!entries.length) {
    throw new Error(
      `${ERROR_PREFIX}: keyValueMap must be an object thats maps string keys to string values.`,
    );
  }
  checkMultipleKeysLength('checkKeyValue', entries.length);
  entries.forEach(([k, v]) => checkKeyValue(k, v));
};

export const checkKeys = (keys: string[]) => {
  if (!keys || !Array.isArray(keys) || !keys.length) {
    throw new Error(
      `${ERROR_PREFIX}: keys must be an array of strings (key names).`,
    );
  }
  checkMultipleKeysLength('checkKeys', keys.length);
  keys.forEach(checkKey);
};

export const getNamespaceId = (
  baseInputs: IBaseInputs,
  namespaceId?: string,
) => {
  const nsId = namespaceId || baseInputs.namespaceId;
  if (!nsId) {
    throw new Error(
      `${ERROR_PREFIX}: namepspaceId wasn't provided to either WorkersKV or the specific method.`,
    );
  }
  return nsId;
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
