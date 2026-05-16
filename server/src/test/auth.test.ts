import request from 'supertest';
import app from '../index';
import User from '../models/User';

jest.mock('../models/User');
const MockUser = User as jest.Mocked<typeof User>;

describe('Auth Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  it('POST /register - success', async () => {
    MockUser.findOne.mockResolvedValue(null);
    MockUser.create.mockResolvedValue({
      _id: '1',
      email: 'test@test.com',
      name: 'Test',
      surname: 'User',
      toJSON: () => ({ _id: '1', email: 'test@test.com', name: 'Test', surname: 'User' }),
    } as any);

    const res = await request(app).post('/api/auth/register').send({
      email: 'test@test.com',
      password: '123456',
      name: 'Test',
      surname: 'User',
      repeatPassword: '123456',
    });
    expect(res.statusCode).toBe(201);
  });

  it('POST /register - user exists', async () => {
    MockUser.findOne.mockResolvedValue({ email: 'test@test.com' } as any);

    const res = await request(app).post('/api/auth/register').send({
      email: 'test@test.com',
      password: '123456',
      name: 'Test',
      surname: 'User',
      repeatPassword: '123456',
    });
    expect(res.statusCode).toBe(400);
  });

  it('POST /login - invalid credentials', async () => {
    const mockUser = {
      _id: 'u1',
      email: 'test@test.com',
      password: 'hashed_correct_password',
      comparePassword: jest.fn().mockResolvedValue(false),
      toJSON: () => ({ _id: 'u1', email: 'test@test.com' }),
    };

    MockUser.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    } as any);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrongpass' });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('POST /logout & /refresh - branches', async () => {
    let res = await request(app).post('/api/auth/logout');
    expect(res.statusCode).toBe(200);

    res = await request(app).post('/api/auth/refresh');
    expect(res.statusCode).toBe(401);
  });

  it('POST /register - invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bad-email', password: '123456' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /register - short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: '123' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /login - success', async () => {
    MockUser.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'u1',
        email: 'test@test.com',
        password: 'hashed',
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: () => ({ _id: 'u1', email: 'test@test.com', name: 'Test' }),
      }),
    } as any);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'correct' });
    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it('POST /register - validation error (short password)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 't@t.com', password: '123', name: 'T', surname: 'U', repeatPassword: '123' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /refresh - missing token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});
    expect(res.statusCode).toBe(401);
  });
});
