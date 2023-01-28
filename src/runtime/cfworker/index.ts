import { Hono } from 'hono';

import { ignition } from '@/api';

const app = new Hono() as THono;

ignition(app);

export default {
  ...app,
};
