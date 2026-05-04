import request from 'supertest';
import app from '../index';
import Task from '../models/Task';
import Project from '../models/Project';
import jwt from 'jsonwebtoken';
import Notification from '../models/Notification';

jest.mock('../models/Task');
jest.mock('../models/Project');
jest.mock('../models/Notification');
const MockNotification = Notification as jest.Mocked<typeof Notification>;
const MockTask = Task as jest.Mocked<typeof Task>;
const MockProject = Project as jest.Mocked<typeof Project>;

const token = jwt.sign({ userId: 'u1' }, process.env.JWT_SECRET!, { expiresIn: '15m' });

describe('Task Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  it('POST /tasks - success & project check', async () => {
    MockProject.findOne.mockResolvedValue({ _id: 'p1' } as any);
    MockTask.countDocuments.mockResolvedValue(0);
    MockTask.create.mockResolvedValue({ _id: 't1', title: 'T' } as any);
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'T', projectId: 'p1' });
    expect(res.statusCode).toBe(201);
  });

  it('PUT /tasks/:id - limit check & done trigger', async () => {
    MockNotification.create.mockResolvedValue({ _id: 'n1' } as any);
    MockTask.countDocuments.mockResolvedValueOnce(5);
    let res = await request(app)
      .put('/api/tasks/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'in_progress' });
    expect(res.statusCode).toBe(400);

    MockTask.countDocuments.mockResolvedValueOnce(0);
    MockTask.findOneAndUpdate.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      title: 'T',
      status: 'done',
      userId: '507f1f77bcf86cd799439011',
    } as any);

    res = await request(app)
      .put('/api/tasks/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'done' });
    expect(res.statusCode).toBe(200);
  });

  it('DELETE /tasks/:id & Subtasks CRUD', async () => {
    MockTask.findOneAndDelete.mockResolvedValue({ _id: 't1' } as any);
    let res = await request(app).delete('/api/tasks/t1').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);

    MockTask.findOneAndUpdate.mockResolvedValue({ _id: 't1', checklist: [] } as any);
    res = await request(app)
      .post('/api/tasks/t1/subtasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Sub' });
    expect(res.statusCode).toBe(200);
  });
});
