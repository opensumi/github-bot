import { ValidationError } from '@/services/github';

import { assert } from './assert';

export function objectRequired<
  T extends {
    get(key: string): string | undefined | null;
  },
>(obj: T, objectName: string, keys: string[]) {
  for (const key of keys) {
    assert(
      obj.get(key),
      new ValidationError(400, `${objectName} Required Property: ${key}`),
    );
  }
}
