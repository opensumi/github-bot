export enum KnownRepo {
  OpenSumi = 'opensumi/core',
  AntDesignMini = 'ant-design/ant-design-mini',
}

export const ISSUE_REGEX = /^#(?<number>\d+)$/;
export const REPO_REGEX =
  /^(?<owner>[a-zA-Z0-9][a-zA-Z0-9\-]*)\/(?<repo>[a-zA-Z0-9_\-.]+)$/;
