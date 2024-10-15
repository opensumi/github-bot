import { AdminService } from '@/services/admin';

export function route(hono: THono) {
  hono.get('/admin/initialize', async (c) => {
    const oldToken = c.req.query('oldToken');
    const newToken = c.req.query('newToken');

    if (!newToken) {
      return c.send.error(400, 'newToken is required');
    }

    const oldAdminToken = await AdminService.instance().getAdminToken();
    if (oldAdminToken && oldAdminToken !== oldToken) {
      return c.send.error(400, 'oldToken is not correct');
    }

    await AdminService.instance().setAdminToken(newToken);
    return c.send.message('Token updated successfully');
  });

  hono.get('/admin/configure-scope', async (c) => {
    const scope = c.req.query('scope');
    const token = c.req.query('token');
    const adminToken = c.req.query('adminToken');
    if (!adminToken) {
      return c.send.error(400, 'bad request');
    }

    const existsAdminToken = await AdminService.instance().getAdminToken();
    if (!existsAdminToken) {
      return c.send.error(400, 'server is not initialized');
    }

    if (existsAdminToken !== adminToken) {
      return c.send.error(400, 'token is not correct');
    }

    if (!scope) {
      return c.send.error(400, 'scope is required');
    }

    if (!token) {
      return c.send.error(400, 'token is required');
    }

    await AdminService.instance().setScopeToken(scope, token);

    return c.send.message('Token updated successfully');
  });
}
