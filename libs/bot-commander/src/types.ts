import { CancellationToken } from '@opensumi/ide-utils';
import mri from 'mri';

export interface ICommand<T> {
  arg0: string;

  args: mri.Argv<T>;
  argv: string[];

  raw: string;

  /**
   * removed prefix
   */
  command: string;
}

export interface BaseContext {
  token: CancellationToken;
}

export interface RegexContext extends BaseContext {
  result: IRegexResolveResult;
}

export type TRegexHandler<C> = (
  ctx: C & RegexContext,
  command: ICommand<any>,
) => Promise<void>;

export type TTextHandler<C> = (
  ctx: C & BaseContext,
  command: ICommand<any>,
) => Promise<void>;

export type TStarHandler<C> = (
  ctx: C & BaseContext,
  command: ICommand<any>,
) => Promise<void>;

export type THandler<C> = TRegexHandler<C> | TTextHandler<C> | TStarHandler<C>;

export type CompareFunc<T> = (command: T, userInput: string) => boolean;

export type FuncName = 'equal' | 'startwiths';

export interface ITextResolveResult {
  handler: TTextHandler<any>;
  type: 'text';

  command: string;
}

export interface IRegexResolveResult {
  type: 'regex';
  regex: RegExp;
  handler: TRegexHandler<any>;
  result: RegExpExecArray;
  command: string;
}

export interface IStarResolveResult {
  handler: TStarHandler<any>;
  type: 'star';

  command: string;
}

export type IResolveResult =
  | ITextResolveResult
  | IRegexResolveResult
  | IStarResolveResult;
