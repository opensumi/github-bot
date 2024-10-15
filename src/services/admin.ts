import { AdminDAO } from '@/dal/admin';
import { EValidLevel } from '@/dal/types';

export class AdminService {
  private dao: AdminDAO;
  private constructor() {
    this.dao = AdminDAO.instance();
  }
  private static _instance: AdminService;
  static instance() {
    if (!this._instance) {
      this._instance = new AdminService();
    }
    return this._instance;
  }

  async isTokenValidFor(token?: string, scope?: string): Promise<EValidLevel> {
    if (!token) return EValidLevel.None;
    if (scope) {
      const tokenByScope = await this.dao.getTokenByScope(scope);
      if (tokenByScope && tokenByScope === token) return EValidLevel.Normal;
    }
    const adminToken = await this.dao.getAdminToken();
    if (adminToken && adminToken === token) return EValidLevel.Admin;
    return EValidLevel.None;
  }

  async getAdminToken() {
    return this.dao.getAdminToken();
  }

  async setAdminToken(token: string) {
    return this.dao.setAdminToken(token);
  }

  async setScopeToken(scope: string, token: string) {
    return this.dao.setScopeToken(scope, token);
  }
}
