export function mockFetchEvent(req: Request) {
  const event = new Event('fetch');
  return {
    ...event,
    stopImmediatePropagation: () => {
      return;
    },
    preventDefault: () => {
      return;
    },
    stopPropagation: () => {
      return;
    },
    composedPath: (() => {
      return;
    }) as any,
    waitUntil: async (fn: any) => {
      await fn?.();
    },
    respondWith(promise: Response | Promise<Response>) {
      return;
    },
    passThroughOnException() {
      return;
    },
    request: req,
  };
}
