import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CalendarPage from '../CalendarPage';
import { useGetCalendarTasksQuery } from '../../../features/calendar/calendarApi';

jest.mock('../../../features/calendar/calendarApi', () => ({
  useGetCalendarTasksQuery: jest.fn(),
}));

const mockStore = configureStore({
  reducer: {
    auth: (state = { user: { name: 'Test' } }) => state,
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  );
};

describe('CalendarPage', () => {
  const mockTasks = [
    {
      _id: 't1',
      title: 'Calendar Task',
      status: 'todo',
      priority: 'high',
      deadlineType: 'hard',
      deadline: '2026-05-20T10:00:00Z',
      projectId: 'p1',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      userId: 'u1',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders calendar header', () => {
    (useGetCalendarTasksQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderWithProviders(<CalendarPage />);
    expect(screen.getByText(/календарь/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /сегодня/i })).toBeInTheDocument();
  });

  it('renders calendar grid', () => {
    (useGetCalendarTasksQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderWithProviders(<CalendarPage />);
    expect(screen.getByText('Пн')).toBeInTheDocument();
    expect(screen.getByText('Вт')).toBeInTheDocument();
  });

  it('navigates to previous month', () => {
    (useGetCalendarTasksQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderWithProviders(<CalendarPage />);
    const prevBtn = screen.getAllByRole('button')[0];
    fireEvent.click(prevBtn);
  });

  it('navigates to next month', () => {
    (useGetCalendarTasksQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderWithProviders(<CalendarPage />);
    const nextBtn = screen.getAllByRole('button')[2];
    fireEvent.click(nextBtn);
  });

  it('selects a date and shows tasks sidebar', () => {
    (useGetCalendarTasksQuery as jest.Mock).mockReturnValue({
      data: mockTasks,
      isLoading: false,
    });

    renderWithProviders(<CalendarPage />);
    const dayCell = screen.getByText('20');
    fireEvent.click(dayCell);
    const taskTitle = screen.getAllByText('Calendar Task')[0];
    expect(taskTitle).toBeInTheDocument();
  });

  it('renders task mini cards in calendar', () => {
    const mockTasks = [
      {
        _id: 't1',
        title: 'Calendar Task',
        status: 'todo',
        priority: 'high',
        deadlineType: 'hard',
        deadline: '2026-05-20T10:00:00Z',
        projectId: 'p1',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        userId: 'u1',
      },
    ];

    (useGetCalendarTasksQuery as jest.Mock).mockReturnValue({
      data: mockTasks,
      isLoading: false,
    });

    renderWithProviders(<CalendarPage />);
    expect(screen.getByText('Calendar Task')).toBeInTheDocument();
  });
});
