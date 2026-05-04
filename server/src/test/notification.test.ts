import request from 'supertest';
import app from '../index';
import Notification from '../models/Notification';
import jwt from 'jsonwebtoken';

jest.mock('../models/Notification');
const MockNotification = Notification as jest.Mocked<typeof Notification>;
const token = jwt.sign({ userId: 'u1' }, process.env.JWT_SECRET!, { expiresIn: '15m' });

describe('Notification Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /notifications', async () => {
    MockNotification.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      }),
    } as any);
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('PATCH /read-all & DELETE /:id', async () => {
    MockNotification.updateMany.mockResolvedValue({ modifiedCount: 1 } as any);
    let res = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);

    MockNotification.findOneAndDelete.mockResolvedValue({ _id: 'n1' } as any);
    res = await request(app)
      .delete('/api/notifications/n1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
