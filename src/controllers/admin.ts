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
}
