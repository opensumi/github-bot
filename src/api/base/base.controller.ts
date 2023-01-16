export class BaseController {
  post: THono['post'];
  get: THono['get'];
  all: THono['all'];
  constructor(private hono: THono) {
    this.get = hono.get.bind(hono);
    this.post = hono.post.bind(hono);
    this.all = hono.all.bind(hono);

    this.handle();
  }

  handle() {
    throw new Error('Method Not Implemented');
  }
}
