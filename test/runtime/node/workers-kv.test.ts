import 'dotenv/config';
import { WorkersKV } from '@/runtime/node/workers-kv';

const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
console.log(`🚀 ~ file: workers-kv.test.ts:4 ~ cfAccountId:`, cfAccountId);
const cfAuthToken = process.env.CLOUDFLARE_AUTH_TOKEN!;
console.log(`🚀 ~ file: workers-kv.test.ts:6 ~ cfAuthToken:`, cfAuthToken);
const cfNamespaceId = process.env.CLOUDFLARE_NAMESPACE_ID!;
console.log(`🚀 ~ file: workers-kv.test.ts:8 ~ cfNamespaceId:`, cfNamespaceId);

const shouldSkip = !(cfAccountId && cfAuthToken && cfNamespaceId);
console.log(`🚀 ~ file: workers-kv.test.ts:11 ~ shouldSkip:`, shouldSkip);

(shouldSkip ? describe.skip : describe)('workers kv should work', () => {
  let workerKV: WorkersKV;
  beforeAll(() => {
    workerKV = new WorkersKV(cfAccountId, cfAuthToken, cfNamespaceId);
  });
  it('can put & read', async () => {
    await workerKV.put('test', 'test');

    const result = await workerKV.get('test');
    if (result.ok) {
      const text = await result.text();
      expect(text).toBe('test');
      console.log(`🚀 ~ file: workers-kv.test.ts:23 ~ it ~ text:`, text);
    }

    const result2 = await workerKV.get('test-do-not-exists');
    expect(result2.ok).toBe(false);
    expect(result2.status).toBe(404);
  });

  it('can get json', async () => {
    await workerKV.put('json-test', '{"a":"b"}');

    const result = await workerKV.get('json-test');
    expect(result.ok).toBe(true);
    const text = await result.json();
    console.log(`🚀 ~ file: workers-kv.test.ts:40 ~ it ~ text:`, text);
    expect(text).toEqual({ a: 'b' });
  });
});
