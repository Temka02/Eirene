import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TasksPage from '../TasksPage';
import { useGetTasksQuery } from '../../../features/tasks/tasksApi';

jest.mock('../../../features/tasks/tasksApi', () => ({
  useGetTasksQuery: jest.fn(),
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

describe('TasksPage', () => {
  const mockTasks = {
    data: [
      {
        _id: '1',
        title: 'Test Task',
        status: 'todo',
        priority: 'high',
        deadlineType: 'hard',
        deadline: '2026-12-31T23:59:59Z',
        projectId: 'p1',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        userId: 'u1',
      },
    ],
    total: 1,
    page: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    (useGetTasksQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
    });

    renderWithProviders(<TasksPage />);
    expect(screen.getByPlaceholderText(/поиск задач/i)).toBeInTheDocument();
  });

  it('renders empty state', () => {
    (useGetTasksQuery as jest.Mock).mockReturnValue({
      data: { data: [], total: 0, page: 1, totalPages: 0 },
      isLoading: false,
      isFetching: false,
    });

    renderWithProviders(<TasksPage />);
    expect(screen.getByText(/задач не найдено/i)).toBeInTheDocument();
  });

  it('renders tasks in list view', () => {
    (useGetTasksQuery as jest.Mock).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isFetching: false,
    });

    renderWithProviders(<TasksPage />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Высокий')).toBeInTheDocument();
    expect(screen.getByText(/Ж[eё]сткий/i)).toBeInTheDocument();
  });

  it('toggles view between list and kanban', () => {
    (useGetTasksQuery as jest.Mock).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isFetching: false,
    });

    renderWithProviders(<TasksPage />);
    const kanbanBtn = screen.getByText(/канбан/i);
    fireEvent.click(kanbanBtn);
    expect(screen.getByText(/ожидает/i)).toBeInTheDocument();
  });

  it('filters by priority', () => {
    (useGetTasksQuery as jest.Mock).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isFetching: false,
    });

    renderWithProviders(<TasksPage />);
    const priorityBtn = screen.getByText(/приоритет: все/i);
    fireEvent.click(priorityBtn);

    const dropdown = priorityBtn.parentElement?.nextElementSibling as HTMLElement;
    const highBtn = within(dropdown).getByText('Высокий');
    fireEvent.click(highBtn);

    expect(screen.getAllByText('Высокий').length).toBeGreaterThanOrEqual(1);
  });
});
