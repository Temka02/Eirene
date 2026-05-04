import { errorHandler, AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

describe('Error Handler', () => {
  it('handles AppError', () => {
    const req = {} as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();
    const err = new AppError('Not found', 404);
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(logger.warn).toHaveBeenCalled();
  });

  it('handles generic Error', () => {
    const req = {} as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();
    const err = new Error('Crash');
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(logger.error).toHaveBeenCalled();
  });
});
