// source from: https://github.com/octokit/app.js/blob/48655a321844a0d10a4e203ad19eccb92dd7c797/src/index.ts
import { Octokit as OctokitCore } from '@octokit/core';
import { createAppAuth } from '@octokit/auth-app';
import { OAuthApp } from '@octokit/oauth-app';
import { Webhooks } from '@octokit/webhooks';

import {
  Options,
  ConstructorOptions,
  EachInstallationInterface,
  EachRepositoryInterface,
  GetInstallationOctokitInterface,
} from './types';
import { webhooks } from './webhooks';
import { eachInstallationFactory } from './each-installation';
import { eachRepositoryFactory } from './each-repository';
import { getInstallationOctokit } from './get-installation-octokit';
import { APIWrapper } from './apis';

type Constructor<T> = new (...args: any[]) => T;

type OctokitType<TOptions extends Options> =
  TOptions['Octokit'] extends typeof OctokitCore
    ? InstanceType<TOptions['Octokit']>
    : OctokitCore;

type OctokitClassType<TOptions extends Options> =
  TOptions['Octokit'] extends typeof OctokitCore
    ? TOptions['Octokit']
    : typeof OctokitCore;

export class App<TOptions extends Options = Options> {
  api: APIWrapper;
  static defaults<
    TDefaults extends Options,
    S extends Constructor<App<TDefaults>>,
  >(this: S, defaults: Partial<TDefaults>) {
    const AppWithDefaults = class extends this {
      constructor(...args: any[]) {
        super({
          ...defaults,
          ...args[0],
        });
      }
    };

    return AppWithDefaults as typeof AppWithDefaults & typeof this;
  }

  octokit: OctokitType<TOptions>;
  webhooks!: Webhooks<{ octokit: OctokitType<TOptions> }>;
  oauth!: OAuthApp<{
    clientType: 'github-app';
    Octokit: OctokitClassType<TOptions>;
  }>;
  getInstallationOctokit: GetInstallationOctokitInterface<
    OctokitType<TOptions>
  >;
  eachInstallation: EachInstallationInterface<OctokitType<TOptions>>;
  eachRepository: EachRepositoryInterface<OctokitType<TOptions>>;
  log: {
    debug: (message: string, additionalInfo?: object) => void;
    info: (message: string, additionalInfo?: object) => void;
    warn: (message: string, additionalInfo?: object) => void;
    error: (message: string, additionalInfo?: object) => void;
    [key: string]: unknown;
  };

  constructor(options: ConstructorOptions<TOptions>) {
    const Octokit = (options.Octokit ||
      OctokitCore) as OctokitClassType<TOptions>;

    const authOptions = Object.assign(
      {
        appId: options.appId,
        privateKey: options.privateKey,
      },
      options.oauth
        ? {
            clientId: options.oauth.clientId,
            clientSecret: options.oauth.clientSecret,
          }
        : {},
    );

    this.octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: authOptions,
      log: options.log,
    }) as OctokitType<TOptions>;

    this.log = Object.assign(
      {
        debug: () => {
          // noop
        },
        info: () => {
          // noop
        },
        warn: console.warn.bind(console),
        error: console.error.bind(console),
      },
      options.log,
    );

    // set app.webhooks depending on whether "webhooks" option has been passed
    if (options.webhooks) {
      // @ts-expect-error TODO: figure this out
      this.webhooks = webhooks(this.octokit, options.webhooks);
    } else {
      Object.defineProperty(this, 'webhooks', {
        get() {
          throw new Error('[@octokit/app] webhooks option not set');
        },
      });
    }

    // set app.oauth depending on whether "oauth" option has been passed
    if (options.oauth) {
      this.oauth = new OAuthApp({
        ...options.oauth,
        clientType: 'github-app',
        Octokit,
      });
    } else {
      Object.defineProperty(this, 'oauth', {
        get() {
          throw new Error(
            '[@octokit/app] oauth.clientId / oauth.clientSecret options are not set',
          );
        },
      });
    }

    this.getInstallationOctokit = getInstallationOctokit.bind(
      null,
      this,
    ) as GetInstallationOctokitInterface<OctokitType<TOptions>>;
    this.eachInstallation = eachInstallationFactory(
      this,
    ) as EachInstallationInterface<OctokitType<TOptions>>;

    this.eachRepository = eachRepositoryFactory(
      this,
    ) as EachRepositoryInterface<OctokitType<TOptions>>;
    this.api = new APIWrapper(this);
  }
  async getInstallationOcto() {
    for await (const { octokit } of this.eachInstallation.iterator()) {
      return octokit;
    }
    throw new Error('no app installation found');
  }
  async init() {
    await this.api.init();
  }
}
