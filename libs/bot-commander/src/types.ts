import { CancellationToken } from '@opensumi/ide-utils';
import mri from 'mri';

export interface ICommand<T> {
  arg0: string;

  args: mri.Argv<T>;
  argv: string[];

  raw: string;
  rawWithoutPrefix: string;

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
export type TInterceptor<C> = (
  ctx: C & BaseContext,
  command: ICommand<any>,
) => Promise<boolean> | boolean;

export interface CompareFunc<T> {
  (command: T, userInput: string): boolean;
  displayName: string;
}

export type FuncName = 'equal' | 'startwiths';

export interface IBaseResolveResult {
  command: string;
  prefix: string;
}

export interface ITextResolveResult extends IBaseResolveResult {
  handler: TTextHandler<any>;
  type: 'text';
}

export interface IRegexResolveResult extends IBaseResolveResult {
  type: 'regex';
  regex: RegExp;
  handler: TRegexHandler<any>;
  result: RegExpExecArray;
}

export interface IStarResolveResult extends IBaseResolveResult {
  handler: TStarHandler<any>;
  type: 'star';
}

export type IResolveResult =
  | ITextResolveResult
  | IRegexResolveResult
  | IStarResolveResult;
