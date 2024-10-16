import 'dotenv/config';
import { serve } from '@hono/node-server';

import Environment from '@/env';
import { ignition } from '@/ignition';
import { getHostOrigin } from '@/utils/req';
import { runtimeConfig } from './config';
import { LocalKV, NodeKV } from './kv';
import { InMemoryQueue } from './queue';

const port = process.env.PORT ? Number(process.env.PORT) : 8787;

const app = ignition();

serve(
  {
    fetch(request) {
      const kv = process.env.LOCAL_KV ? new LocalKV() : new NodeKV();
      const runtimeEnv: IRuntimeEnv = {
        ...process.env,
        KV: kv,
        MESSAGE_QUEUE: new InMemoryQueue(),
        ENVIRONMENT: 'local',
      };

      const e = Environment.from(runtimeConfig, runtimeEnv, {
        origin: getHostOrigin(request),
      });
      return e.run(async () =>
        app.fetch(
          request,
          {},
          {
            async waitUntil(promise) {
              try {
                await promise;
              } catch (error) {
                console.error(error);
              }
            },
            passThroughOnException() {
              //
            },
          },
        ),
      );
    },
    hostname: '0.0.0.0',
    port,
  },
  (info) => {
    console.log(`Listening on http://0.0.0.0:${info.port}`);
  },
);
