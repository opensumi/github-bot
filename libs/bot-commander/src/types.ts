export type CompareFunc<T> = (command: T, userInput: string) => boolean;

export type FuncName = 'equal' | 'startwiths';

export interface ITextResolveResult {
  handler: any;
  type: 'text';
  /**
   * removed prefix
   */
  command: string;
}

export interface IRegexResolveResult {
  type: 'regex';
  regex: RegExp;
  handler: any;
  result: RegExpExecArray;
  command: string;
}

export interface IStarResolveResult {
  handler: any[];
  type: 'star';
  /**
   * removed prefix
   */
  command: string;
}

export type IResolveResult =
  | ITextResolveResult
  | IRegexResolveResult
  | IStarResolveResult;
