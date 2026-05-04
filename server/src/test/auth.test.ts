import request from 'supertest';
import app from '../index';
import User from '../models/User';

jest.mock('../models/User');
const MockUser = User as jest.Mocked<typeof User>;

describe('Auth Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  it('POST /register - success', async () => {
    MockUser.findOne.mockResolvedValue(null);
    MockUser.create.mockResolvedValue({ _id: '1', email: 'test@test.com', name: 'Test' } as any);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: '123456' });
    expect(res.statusCode).toBe(201);
  });

  it('POST /register - user exists', async () => {
    MockUser.findOne.mockResolvedValue({ email: 'test@test.com' } as any);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: '123456' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /login - invalid credentials', async () => {
    MockUser.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    } as any);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrong' });
    expect(res.statusCode).toBe(401);
  });

  it('POST /logout & /refresh - branches', async () => {
    let res = await request(app).post('/api/auth/logout');
    expect(res.statusCode).toBe(200);
    res = await request(app).post('/api/auth/refresh');
    expect(res.statusCode).toBe(401);
  });
});
