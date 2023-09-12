import type { MiddlewareHandler } from 'hono';
import { getPath } from 'hono/utils/url';

enum LogPrefix {
  Incoming = '-->',
  Outgoing = '<--',
  Error = 'xxx',
}

const humanize = (times: string[]) => {
  const [delimiter, separator] = [',', '.'];

  const orderTimes = times.map((v) =>
    v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + delimiter),
  );

  return orderTimes.join(separator);
};

const time = (start: number) => {
  const delta = Date.now() - start;
  return humanize([
    delta < 1000 ? delta + 'ms' : Math.round(delta / 1000) + 's',
  ]);
};

const colorStatus = (status: number, message?: string) => {
  const statusText = message || status.toString();
  const out: { [key: string]: string } = {
    7: `\x1b[35m${statusText}\x1b[0m`,
    5: `\x1b[31m${statusText}\x1b[0m`,
    4: `\x1b[33m${statusText}\x1b[0m`,
    3: `\x1b[36m${statusText}\x1b[0m`,
    2: `\x1b[32m${statusText}\x1b[0m`,
    1: `\x1b[32m${statusText}\x1b[0m`,
    0: `\x1b[33m${statusText}\x1b[0m`,
  };

  const calculateStatus = (status / 100) | 0;

  return out[calculateStatus];
};

type PrintFunc = (str: string, ...rest: string[]) => void;

function log(
  fn: PrintFunc,
  prefix: string,
  method: string,
  path: string,
  status = 0,
  elapsed?: string,
) {
  const out =
    prefix === LogPrefix.Incoming
      ? `${prefix} ${method} ${path}`
      : `${prefix} ${method} ${path} ${colorStatus(status)} ${elapsed}`;
  fn(out);
}

function logMessage(fn: PrintFunc, prefix: string, ...rest: any[]) {
  fn(`${prefix}`, ...rest);
}

export const logger = (fn: PrintFunc = console.log): MiddlewareHandler => {
  return async (c, next) => {
    const { method, raw } = c.req;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const path = getPath(c.req.raw);

    log(fn, LogPrefix.Incoming, method, path);

    logMessage(
      fn,
      LogPrefix.Incoming,
      'headers',
      JSON.stringify(
        Array.from(raw.headers.entries()).reduce((acc, [k, v]) => {
          acc[k] = v;
          return acc;
        }, {} as Record<any, any>),
      ),
    );

    const start = Date.now();

    await next();

    log(fn, LogPrefix.Outgoing, method, path, c.res.status, time(start));
    logMessage(
      fn,
      LogPrefix.Outgoing,
      'response',
      colorStatus(c.res.status, await c.res.clone().text()),
    );
  };
};
