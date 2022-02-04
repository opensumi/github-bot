export const json = (data: object, options = {}) => {
  const finalOptions = {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
    ...options,
  };
  const json = JSON.stringify(data, null, 2);
  return new Response(json, finalOptions);
};

export const error = (status = 500, content = 'Internal Server Error.') =>
  json(
    {
      status,
      error: content,
    },
    { status },
  );

export const message = (text: string, options = {}) => {
  return json(
    {
      message: text,
    },
    options,
  );
};

export class StringBuilder {
  private array = [] as string[];
  constructor(...initial: string[]) {
    this.array.push(...initial);
  }
  add(str: string) {
    this.array.push(str);
  }
  build() {
    return '\n' + this.array.join('\n') + '\n';
  }
}

// https://github.com/sindresorhus/lazy-value/blob/318fd0fa53b413e066a138ea18750fe2ccf51c04/index.js
export function lazyValue<T>(function_: () => T) {
  let isCalled = false;
  let result: T;

  return () => {
    if (!isCalled) {
      isCalled = true;
      result = function_();
    }

    return result;
  };
}