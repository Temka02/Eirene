import request from 'supertest';
import app from '../index';

describe('Auth Validation', () => {
  it('POST /api/auth/register should return 400 if email is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'invalid-email', password: '123456' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/auth/login should return 400 if fields are missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com' });

    expect(res.statusCode).toBe(400);
  });
});
