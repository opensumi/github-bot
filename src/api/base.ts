type PostArgs = Parameters<THono['post']>;
type GetArgs = Parameters<THono['post']>;
type AllArgs = Parameters<THono['post']>;

class Store<T> {
  data: T[] = [];
  add = (d: T) => {
    this.data.push(d);
  };
  forEach(cb: (v: T) => void) {
    this.data.forEach(cb);
  }
}

const gets = new Store<GetArgs>();
const posts = new Store<PostArgs>();
const alls = new Store<AllArgs>();

export const get: THono['get'] = gets.add as any;
export const post: THono['post'] = posts.add as any;
export const all: THono['all'] = alls.add as any;

export const registerBlueprint = (hono: THono) => {
  gets.forEach((v) => hono.get(...v));
  posts.forEach((v) => hono.post(...v));
  alls.forEach((v) => hono.all(...v));
};
