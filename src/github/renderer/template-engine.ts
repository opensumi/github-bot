import { get } from 'es-toolkit/compat';

import {
  IssuesLink,
  Reference,
  ReleaseLink,
  RepositoryLink,
  SenderLink,
} from '../templates';

const defaultOperators = {
  link: (operator: string, key: string, value) => {
    const [, type] = operator.split(':', 2);
    switch (type || key) {
      case 'sender':
        return SenderLink(value);
      case 'repository':
        return RepositoryLink(value);
      case 'release':
        return ReleaseLink(value);
      case 'pull_request':
      case 'issue':
      case 'discussion':
        return IssuesLink(value);
    }

    return value;
  },
  ref: (operator: string, _key: string, value) => {
    let bodyLimit = -1;
    const [, limit] = operator.split(':', 2);
    if (limit !== undefined) {
      bodyLimit = parseInt(limit, 10);
    }

    return Reference(value, bodyLimit);
  },
  h4: (_operator: string, _key: string, value) => {
    return `#### ${value}`;
  },
} as Record<string, (operator: string, key: string, value: any) => string>;

function processInterpolation(expression: string, context: any) {
  let key = expression;
  const operators = [];
  if (expression.includes('|')) {
    const [_key, ..._operators] = expression.split('|');
    key = _key.trim();
    operators.push(..._operators);
  }

  let value = get(context, key);
  if (!value) {
    return '';
  }

  while (typeof value === 'string' && regex().test(value)) {
    value = renderWorker(value, context);
  }

  if (operators.length > 0) {
    return operators.reduce((result, operator) => {
      const [op, _] = operator.split(':');
      const fn = defaultOperators[op];
      if (fn === undefined) {
        throw new Error(`No operator found for ${op}`);
      }
      return fn(operator, key, result);
    }, value);
  }

  return value;
}

export function processKey(key: string) {
  // remove all spaces and new lines
  key = key.replace(/\s/g, '');
  return key;
}

const regex = () => /{{\s*([^}]+)\s*}}/g;

function renderWorker(template: string, context: any) {
  return template.replace(regex(), (raw, key) => {
    try {
      return processInterpolation(processKey(key), context);
    } catch (e) {
      console.error(`render template engine error`, e);
      return raw;
    }
  });
}

export function render(template: string, context: any): string {
  let result = template;
  while (regex().test(result)) {
    result = renderWorker(result, context);
  }

  return result;
}
