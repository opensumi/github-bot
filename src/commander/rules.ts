import { CompareFunc } from './types';

export const equalFunc: CompareFunc<string> = (
  command: string,
  userInput: string,
) => {
  return command === userInput;
};

export const startsWith: CompareFunc<string> = (
  command: string,
  userInput: string,
) => {
  return userInput.startsWith(command) || command.startsWith(userInput);
};

export const regex = (reg: RegExp, userInput: string) => {
  return Boolean(userInput.match(reg));
};

export const rules = {
  equalFunc: equalFunc.name,
  startsWith: startsWith.name,
  regex: regex.name,
};
