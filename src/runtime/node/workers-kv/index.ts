import { IBaseInputs } from './types';
import {
  checkKey,
  checkKeys,
  checkLimit,
  checkKeyValue,
  getNamespaceId,
  getQueryString,
  checkKeyValueMap,
  getPathWithQueryString,
  MAX_KEYS_LIMIT,
  getAuthHeaders,
  httpsReq,
} from './utils';

export class WorkersKV {
  baseInputs: IBaseInputs;
  constructor({
    cfAccountId,
    cfEmail,
    cfAuthKey,
    cfAuthToken,
    namespaceId = '',
  }: {
    cfAccountId: string;
    cfEmail?: string;
    cfAuthKey?: string;
    cfAuthToken?: string;
    namespaceId?: string;
  }) {
    const host = 'api.cloudflare.com';
    const basePath = `/client/v4/accounts/${cfAccountId}/storage/kv/namespaces`;
    const headers = getAuthHeaders(cfEmail, cfAuthKey, cfAuthToken);

    this.baseInputs = { host, basePath, namespaceId, headers } as IBaseInputs;
  }

  listKeys = async ({
    limit = MAX_KEYS_LIMIT,
    cursor = undefined,
    prefix = undefined,
  }: {
    limit?: number;
    cursor?: string;
    prefix?: string;
  }) => {
    checkLimit(limit);
    const { host, basePath, headers } = this.baseInputs;
    const nsId = getNamespaceId(this.baseInputs);

    const qs = getQueryString({ limit, cursor, prefix });
    const path = getPathWithQueryString(`${basePath}/${nsId}/keys`, qs);
    const method = 'GET';
    const options = { method, host, path, headers };

    return httpsReq(options);
  };

  listAllKeys = async ({ prefix = undefined, limit = MAX_KEYS_LIMIT } = {}) => {
    checkLimit(limit);

    const results = [] as any[];
    let result_info = null;
    let cursor = '';

    do {
      const data = await this.listKeys({
        limit,
        prefix,
        cursor,
      });

      const { success, result } = data.data as any;

      success && result.forEach((x: any) => results.push(x));

      ({ result_info } = data.data as any);
      ({ cursor } = result_info);
    } while (result_info && result_info.cursor);

    return {
      success: true,
      result: results,
      result_info: { count: results.length },
    };
  };

  listNamespaces = async ({ page = 1, per_page = 50 } = {}) => {
    const { host, basePath, headers } = this.baseInputs;
    const qs = getQueryString({ page, per_page });
    const path = getPathWithQueryString(basePath, qs);
    const method = 'GET';
    const options = { method, host, path, headers };

    return httpsReq(options);
  };

  writeKey = async ({
    key,
    value,
    expiration = undefined,
    expiration_ttl = undefined,
  }: {
    key: string;
    value: any;
    expiration?: any;
    expiration_ttl?: any;
  }) => {
    checkKeyValue(key, value);
    const { host, basePath, headers } = this.baseInputs;
    const nsId = getNamespaceId(this.baseInputs);

    const qs = getQueryString({ expiration, expiration_ttl });
    const keyPath = `${basePath}/${nsId}/values/${key}`;
    const path = getPathWithQueryString(keyPath, qs);
    const method = 'PUT';
    const putHeaders = {
      ...headers,
      'Content-Type': 'text/plain',
      'Content-Length': value.length,
    };

    const options = { method, host, path, headers: putHeaders };

    return httpsReq(options, value);
  };

  readKey = async ({ key }: { key: string }) => {
    checkKey(key);
    const { host, basePath, headers } = this.baseInputs;
    const nsId = getNamespaceId(this.baseInputs);

    const path = `${basePath}/${nsId}/values/${key}`;
    const method = 'GET';
    const options = { method, host, path, headers };

    return httpsReq(options);
  };

  deleteKey = async ({ key }: { key: string }) => {
    checkKey(key);
    const { host, basePath, headers } = this.baseInputs;
    const nsId = getNamespaceId(this.baseInputs);

    const path = `${basePath}/${nsId}/values/${key}`;
    const method = 'DELETE';
    const options = { method, host, path, headers };

    return httpsReq(options);
  };

  writeMultipleKeys = async ({
    keyValueMap,
    expiration = undefined,
    expiration_ttl = undefined,
    base64 = false,
  }: {
    keyValueMap: Record<string, any>;
    expiration: any;
    expiration_ttl: any;
    base64: any;
  }) => {
    checkKeyValueMap(keyValueMap);
    const { host, basePath, headers } = this.baseInputs;
    const nsId = getNamespaceId(this.baseInputs);

    const qs = getQueryString({ expiration, expiration_ttl });
    const bulkPath = `${basePath}/${nsId}/bulk`;
    const path = getPathWithQueryString(bulkPath, qs);
    const method = 'PUT';

    const bodyArray = Object.entries(keyValueMap).map(([key, value]) => ({
      key,
      value,
      base64,
    }));

    const body = JSON.stringify(bodyArray);
    const putHeaders = {
      ...headers,
      'Content-Type': 'application/json',
      'Content-Length': body.length,
    };

    const options = { method, host, path, headers: putHeaders };
    return httpsReq(options, body);
  };

  deleteMultipleKeys = async ({ keys }: { keys: string[] }) => {
    checkKeys(keys);
    const { host, basePath, headers } = this.baseInputs;
    const nsId = getNamespaceId(this.baseInputs);

    const path = `${basePath}/${nsId}/bulk`;
    const method = 'DELETE';
    const body = JSON.stringify(keys);
    const deleteHeaders = {
      ...headers,
      'Content-Type': 'application/json',
      'Content-Length': body.length,
    };
    const options = { method, host, path, headers: deleteHeaders };

    return httpsReq(options, body);
  };
}
