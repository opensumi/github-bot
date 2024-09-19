import 'dotenv/config';
import { serve } from '@hono/node-server';

import { ignition } from '@/api';

const port = process.env.PORT ? Number(process.env.PORT) : 8787;

const app = ignition();

serve(
  {
    fetch(request) {
      return app.fetch(
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
      );
    },
    hostname: '0.0.0.0',
    port,
  },
  (info) => {
    console.log(`Listening on http://0.0.0.0:${info.port}`);
  },
);
