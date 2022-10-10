export class BaseController {
  post: THono['post'];
  all: THono['all'];
  constructor(private hono: THono) {
    this.handle();
    this.post = hono.post.bind(hono);
    this.all = hono.all.bind(hono);
  }
  handle() {
    throw new Error('Method Not Implemented');
  }
}
