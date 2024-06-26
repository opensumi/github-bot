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
          waitUntil(promise) {
            promise;
          },
          passThroughOnException() {
            //
          },
        },
      );
    },
    port: port,
  },
  (info) => {
    console.log(`Listening on http://localhost:${info.port}`);
  },
);
