type TaskPriority = 'high' | 'medium' | 'low';
type TaskDeadlineType = 'hard' | 'soft' | 'none';

const getPriorityConfig = (p: TaskPriority) => {
  switch (p) {
    case 'high':
      return {
        label: 'Высокий',
        color: 'text-[#D32F2F]',
        icon: '/highPriority-icon.svg',
        bg: 'bg-[#FFEDEE]',
      };
    case 'medium':
      return {
        label: 'Средний',
        color: 'text-[#F59E0B]',
        icon: '/mediumPriority-icon.svg',
        bg: 'bg-[#FFF4E5]',
      };
    case 'low':
      return {
        label: 'Низкий',
        color: 'text-[#10B981]',
        icon: '/lowPriority-icon.svg',
        bg: 'bg-[#E6F9F1]',
      };
    default:
      return { label: '', color: '', icon: '', bg: '' };
  }
};

const getDeadlineTypeConfig = (dt: TaskDeadlineType) => {
  switch (dt) {
    case 'hard':
      return {
        label: 'Жесткий',
        color: 'text-[#D32F2F]',
        icon: '/hardDeadlineType-icon.svg',
        bg: 'bg-[#FFEDEE]',
      };
    case 'soft':
      return {
        label: 'Мягкий',
        color: 'text-[#10B981]',
        icon: '/softDeadlineType-icon.svg',
        bg: 'bg-[#E6F9F1]',
      };
    case 'none':
      return {
        label: 'Без срока',
        color: 'text-[#6F7D75]',
        icon: '/noDeadline-icon.svg',
        bg: 'bg-[#F3F4F6]',
      };
    default:
      return { label: '', color: '', icon: '', bg: '' };
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return { text: '—', isOverdue: false };
  const date = new Date(dateStr);
  const now = new Date();
  const isOverdue = date < now;
  return {
    text: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
    isOverdue,
  };
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return 'Доброе утро';
  if (hour < 17) return 'Добрый день';
  return 'Добрый вечер';
};

describe('DashboardPage helpers', () => {
  describe('getPriorityConfig', () => {
    it('returns correct config for high priority', () => {
      expect(getPriorityConfig('high')).toEqual({
        label: 'Высокий',
        color: 'text-[#D32F2F]',
        icon: '/highPriority-icon.svg',
        bg: 'bg-[#FFEDEE]',
      });
    });

    it('returns correct config for medium priority', () => {
      expect(getPriorityConfig('medium')).toEqual({
        label: 'Средний',
        color: 'text-[#F59E0B]',
        icon: '/mediumPriority-icon.svg',
        bg: 'bg-[#FFF4E5]',
      });
    });

    it('returns correct config for low priority', () => {
      expect(getPriorityConfig('low')).toEqual({
        label: 'Низкий',
        color: 'text-[#10B981]',
        icon: '/lowPriority-icon.svg',
        bg: 'bg-[#E6F9F1]',
      });
    });
  });

  describe('getDeadlineTypeConfig', () => {
    it('returns correct config for hard deadline', () => {
      expect(getDeadlineTypeConfig('hard')).toEqual({
        label: 'Жесткий',
        color: 'text-[#D32F2F]',
        icon: '/hardDeadlineType-icon.svg',
        bg: 'bg-[#FFEDEE]',
      });
    });

    it('returns correct config for soft deadline', () => {
      expect(getDeadlineTypeConfig('soft')).toEqual({
        label: 'Мягкий',
        color: 'text-[#10B981]',
        icon: '/softDeadlineType-icon.svg',
        bg: 'bg-[#E6F9F1]',
      });
    });

    it('returns correct config for none deadline', () => {
      expect(getDeadlineTypeConfig('none')).toEqual({
        label: 'Без срока',
        color: 'text-[#6F7D75]',
        icon: '/noDeadline-icon.svg',
        bg: 'bg-[#F3F4F6]',
      });
    });
  });

  describe('formatDate', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-05-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns dash for undefined date', () => {
      const result = formatDate(undefined);
      expect(result.text).toBe('—');
      expect(result.isOverdue).toBe(false);
    });

    it('formats valid date correctly', () => {
      const result = formatDate('2026-12-31T23:59:59Z');
      expect(result.text).toBe('31 дек.');
    });

    it('detects overdue date', () => {
      const result = formatDate('2026-05-10T10:00:00Z');
      expect(result.isOverdue).toBe(true);
    });

    it('detects future date as not overdue', () => {
      const result = formatDate('2026-06-01T10:00:00Z');
      expect(result.isOverdue).toBe(false);
    });
  });

  describe('getGreeting', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns "Доброе утро" between 00:00 and 10:59', () => {
      jest.setSystemTime(new Date('2026-05-15T09:00:00'));
      expect(getGreeting()).toBe('Доброе утро');
    });

    it('returns "Добрый день" between 11:00 and 16:59', () => {
      jest.setSystemTime(new Date('2026-05-15T13:00:00'));
      expect(getGreeting()).toBe('Добрый день');
    });

    it('returns "Добрый вечер" from 17:00 onwards', () => {
      jest.setSystemTime(new Date('2026-05-15T20:00:00'));
      expect(getGreeting()).toBe('Добрый вечер');
    });
  });
});

export {};
