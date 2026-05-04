import request from 'supertest';
import app from '../index';
import Project from '../models/Project';
import Task from '../models/Task';
import jwt from 'jsonwebtoken';

jest.mock('../models/Project');
jest.mock('../models/Task');
const MockProject = Project as jest.Mocked<typeof Project>;
const MockTask = Task as jest.Mocked<typeof Task>;

const token = jwt.sign({ userId: 'u1' }, process.env.JWT_SECRET!, { expiresIn: '15m' });

describe('Project Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /projects - with progress calculation', async () => {
    MockProject.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        {
          _id: '507f1f77bcf86cd799439011',
          toObject: () => ({ _id: '507f1f77bcf86cd799439011' }),
        },
      ]),
    } as any);
    MockTask.countDocuments.mockResolvedValueOnce(10).mockResolvedValueOnce(5);
    const res = await request(app).get('/api/projects').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body[0].progress).toBe(50);
  });

  it('PUT /projects/:id & DELETE /projects/:id', async () => {
    MockProject.findOneAndUpdate.mockResolvedValue({ _id: 'p1' } as any);
    let res = await request(app)
      .put('/api/projects/p1')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New' });
    expect(res.statusCode).toBe(200);

    MockTask.deleteMany.mockResolvedValue({ deletedCount: 1 } as any);
    MockProject.findOneAndDelete.mockResolvedValue({ _id: 'p1' } as any);
    res = await request(app).delete('/api/projects/p1').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
