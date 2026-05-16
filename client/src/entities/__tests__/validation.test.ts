import {
  loginSchema,
  registerSchema,
  taskSchema,
  projectSchema,
  profileSchema,
} from '../validation';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('passes valid login data', () => {
      const result = loginSchema.safeParse({ email: 'test@mail.com', password: '123456' });
      expect(result.success).toBe(true);
    });

    it('fails with invalid email', () => {
      const result = loginSchema.safeParse({ email: 'bad-email', password: '123456' });
      expect(result.success).toBe(false);
    });

    it('fails with short password', () => {
      const result = loginSchema.safeParse({ email: 'test@mail.com', password: '123' });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('passes valid register data', () => {
      const result = registerSchema.safeParse({
        name: 'Art',
        surname: 'M',
        email: 'art@mail.com',
        password: '123456',
        repeatPassword: '123456',
      });
      expect(result.success).toBe(true);
    });

    it('fails if passwords do not match', () => {
      const result = registerSchema.safeParse({
        name: 'Art',
        surname: 'M',
        email: 'art@mail.com',
        password: '123456',
        repeatPassword: '654321',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('taskSchema', () => {
    it('passes valid task data', () => {
      const result = taskSchema.safeParse({
        title: 'Buy milk',
        priority: 'high',
        deadlineType: 'hard',
        deadline: '2024-01-01',
      });
      expect(result.success).toBe(true);
    });

    it('fails if deadline is missing for hard type', () => {
      const result = taskSchema.safeParse({
        title: 'Buy milk',
        priority: 'high',
        deadlineType: 'hard',
        deadline: undefined,
      });
      expect(result.success).toBe(false);
    });

    it('passes if deadline is missing for none type', () => {
      const result = taskSchema.safeParse({
        title: 'Buy milk',
        priority: 'high',
        deadlineType: 'none',
        deadline: undefined,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('projectSchema', () => {
    it('passes valid project data', () => {
      const result = projectSchema.safeParse({ title: 'My Project', icon: 'plant' });
      expect(result.success).toBe(true);
    });

    it('fails with too long title', () => {
      const result = projectSchema.safeParse({
        title: 'a'.repeat(51),
        icon: 'plant',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('profileSchema', () => {
    it('passes valid profile data', () => {
      const result = profileSchema.safeParse({
        name: 'Иван',
        surname: 'Иванов',
        email: 'ivan@test.com',
      });
      expect(result.success).toBe(true);
    });

    it('fails with empty name', () => {
      const result = profileSchema.safeParse({
        name: '',
        surname: 'Иванов',
        email: 'ivan@test.com',
      });
      expect(result.success).toBe(false);
    });

    it('fails with invalid email', () => {
      const result = profileSchema.safeParse({
        name: 'Иван',
        surname: 'Иванов',
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });
  });
});
