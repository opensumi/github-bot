import { THono } from '@/types';

export class BaseController {
  constructor(protected hono: THono) {
    this.handle();
  }
  handle() {
    throw new Error('Method Not Implemented');
  }
}
