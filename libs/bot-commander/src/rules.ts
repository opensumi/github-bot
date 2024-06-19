import { CompareFunc } from './types';

export const equalFunc: CompareFunc<string> = (
  command: string,
  userInput: string,
) => {
  return command === userInput;
};

equalFunc.displayName = 'equal';

export const regex = (reg: RegExp, userInput: string) => {
  return Boolean(userInput.match(reg));
};
regex.displayName = 'regex';
