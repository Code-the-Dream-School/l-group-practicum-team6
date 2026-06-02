import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import * as jwt from 'jsonwebtoken';
import signature from 'cookie-signature';

let app: typeof import('../../src/app').default;

describe('Admin visualizer routes', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_LIFETIME = '1d';
    process.env.CLIENT_URL = 'http://localhost:5173';

    app = (await import('../../src/app')).default;
  });

  function buildAuthCookie(isAdmin: boolean) {
    const secret = process.env.JWT_SECRET as string;
    const token = jwt.sign(
      {
        userId: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
        isAdmin,
      },
      secret,
      { expiresIn: '1d' }
    );

    const signedToken = `s:${signature.sign(token, secret)}`;
    return `token=${signedToken}`;
  }

  it('returns 403 for non-admin authenticated users on all admin visualizer routes', async () => {
    const cookie = buildAuthCookie(false);

    const createRes = await request(app)
      .post('/api/v1/admin/visualizers')
      .set('Cookie', [cookie])
      .send({
        name: 'Forbidden Visualizer',
        source: 'admin',
        glsl: 'void main() { gl_FragColor = vec4(1.0); }',
        isDemo: false,
        tags: ['forbidden'],
      });

    const patchRes = await request(app)
      .patch('/api/v1/admin/visualizers/507f1f77bcf86cd799439011')
      .set('Cookie', [cookie])
      .send({ name: 'Nope' });

    const deleteRes = await request(app)
      .delete('/api/v1/admin/visualizers/507f1f77bcf86cd799439011')
      .set('Cookie', [cookie]);

    expect(createRes.status).toBe(403);
    expect(patchRes.status).toBe(403);
    expect(deleteRes.status).toBe(403);
  });

  it('returns 400 when creating a visualizer without glsl', async () => {
    const cookie = buildAuthCookie(true);

    const res = await request(app)
      .post('/api/v1/admin/visualizers')
      .set('Cookie', [cookie])
      .send({
        name: 'No Shader',
        source: 'admin',
        isDemo: false,
        tags: ['invalid'],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Please provide glsl');
  });
});
