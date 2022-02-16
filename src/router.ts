// copied and modified from https://github.com/kwhitley/itty-router/blob/f19c908205a7520a7369042228cee1b948ba1130/src/itty-router.js
/* eslint-disable */
// @ts-nocheck

const Router = ({ base = '', routes = [] } = {}) => ({
  __proto__: new Proxy(
    {},
    {
      get:
        (target, prop, receiver) =>
        (route: string, ...handlers: any) =>
          routes.push([
            prop.toUpperCase(),
            RegExp(
              `^${
                (base + route)
                  .replace(/(\/?)\*/g, '($1.*)?')
                  .replace(/\/$/, '')
                  .replace(/:(\w+)(\?)?(\.)?/g, '$2(?<$1>[^/]+)$2$3')
                  .replace(/\.(?=[\w(])/, '\\.')
                  .replace(/\)\.\?\(([^\[]+)\[\^/g, '?)\\.?($1(?<=\\.)[^\\.') // RIP all the bytes lost :'(
              }/*$`,
            ),
            handlers,
          ]) && receiver,
    },
  ),
  // eslint-disable-next-line object-shorthand
  routes,
  async handle(request, ...args) {
    let response,
      match,
      url = new URL(request.url);
    request.query = Object.fromEntries(url.searchParams);
    for (let [method, route, handlers] of routes) {
      if (
        (method === request.method || method === 'ALL') &&
        (match = url.pathname.match(route))
      ) {
        request.params = match.groups;
        for (let handler of handlers) {
          if (
            (response = await handler(request.proxy || request, ...args)) !==
            undefined
          )
            return response;
        }
      }
    }
  },
});

export { Router };

export type Obj = {
  [propName: string]: string;
};

export interface RouteHandler<TRequest> {
  (request: TRequest & Request, ...args: any): any;
}

export interface Route {
  <TRequest>(
    path: string,
    ...handlers: RouteHandler<TRequest & Request>[]
  ): Router<TRequest>;
}

export interface RouteEntry<TRequest> {
  0: string;
  1: RegExp;
  2: RouteHandler<TRequest>[];
}

export interface Request {
  method: string;
  params?: Obj;
  query?: Obj;
  url: string;

  arrayBuffer?(): Promise<any>;
  blob?(): Promise<any>;
  formData?(): Promise<any>;
  json?(): Promise<any>;
  text?(): Promise<any>;
}

export type Router<TRequest> = {
  handle: (request: Request, ...extra: any) => any;
  routes: RouteEntry<TRequest>[];
} & {
  [any: string]: Route;
};

export interface RouterOptions<TRequest> {
  base?: string;
  routes?: RouteEntry<TRequest>[];
}

export function Router<TRequest>(
  options?: RouterOptions<TRequest>,
): Router<TRequest>;
