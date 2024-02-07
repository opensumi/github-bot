import get from 'lodash/get';

import {
  renderReleaseLink,
  renderRepoLink,
  renderUserLink,
} from '../templates';

const defaultOperators = {
  link: (operator: string, key: string, value) => {
    const [, type] = operator.split(':', 2);
    switch (type || key) {
      case 'sender':
        return renderUserLink(value as any);
      case 'repository':
        return renderRepoLink(value as any);
      case 'release':
        return renderReleaseLink(value as any);
    }

    return value;
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

  const value = get(context, key);

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

export function render(template: string, context: any): string {
  return template.replace(/{{\s*([^}]+)\s*}}/g, (raw, key) => {
    try {
      return processInterpolation(processKey(key), context);
    } catch (e) {
      console.error(`render template engine error`, e);
      return raw;
    }
  });
}
