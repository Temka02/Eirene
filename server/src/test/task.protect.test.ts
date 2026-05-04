import request from 'supertest';
import app from '../index';

describe('Task Protection Middleware', () => {
  it('GET /api/tasks should return 401 without token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toContain('Token required');
  });

  it('POST /api/projects should return 401 without token', async () => {
    const res = await request(app).post('/api/projects').send({ title: 'Test Project' });

    expect(res.statusCode).toBe(401);
  });
});
