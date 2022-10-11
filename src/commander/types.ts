export type CompareFunc<T> = (command: T, userInput: string) => boolean;

export type FuncName = 'equal' | 'startwiths';

export interface ITextResolveResult {
  handler: any;
  type: 'text';
}

export interface IRegexResolveResult {
  type: 'regex';
  regex: RegExp;
  handler: any;
}

export type IResolveResult = ITextResolveResult | IRegexResolveResult;
