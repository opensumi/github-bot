export function route(hono: THono) {
  hono.get('/health', (c) => {
    let uptime: number;

    if (
      typeof process !== 'undefined' &&
      typeof process.uptime === 'function'
    ) {
      uptime = process.uptime();
    } else if (
      typeof performance !== 'undefined' &&
      typeof performance.now === 'function'
    ) {
      uptime = performance.now();
    } else {
      uptime = -1;
    }
    return c.json({
      uptime,
      timestamp: Date.now(),
    });
  });
}
