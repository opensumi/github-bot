export enum KnownRepo {
  OpenSumi = 'opensumi/core',
  AntDesignMini = 'ant-design/ant-design-mini',
}

export const ISSUE_REGEX = /^#(?<number>\d+)$/;
export const REPO_REGEX =
  /^(?<owner>[a-zA-Z0-9][a-zA-Z0-9\-]*)\/(?<repo>[a-zA-Z0-9_\-.]+)$/;

export enum TEAM_MEMBERS {
  CONTRIBUTOR = 'contributor',
  CORE_MEMBER = 'core-member',
  MENTOR = 'mentor',
  NONE = 'none',
}

export const TEAM_MEMBER_PR_REQUIREMENT = {
  [TEAM_MEMBERS.CONTRIBUTOR]: 3,
  [TEAM_MEMBERS.CORE_MEMBER]: 5,
  [TEAM_MEMBERS.MENTOR]: 10,
}
