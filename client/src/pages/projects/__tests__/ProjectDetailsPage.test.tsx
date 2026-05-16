import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useParams } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProjectDetailsPage from '../ProjectDetailsPage';
import {
  useGetProjectQuery,
  useGetProjectTasksQuery,
} from '../../../features/projects/projectsApi';

jest.mock('../../../features/projects/projectsApi', () => ({
  useGetProjectQuery: jest.fn(),
  useDeleteProjectMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useGetProjectTasksQuery: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
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

describe('ProjectDetailsPage', () => {
  const mockProject = {
    _id: 'p1',
    title: 'Test Project',
    description: 'Test description',
    icon: 'plant',
    progress: 50,
    totalTasks: 10,
    completedTasks: 5,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  const mockTasks = {
    data: [
      {
        _id: 't1',
        title: 'Task 1',
        status: 'todo',
        priority: 'high',
        deadlineType: 'hard',
        deadline: '2026-12-31',
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

  const emptyTasks = {
    data: [],
    total: 0,
    page: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ id: 'p1' });
  });

  it('renders loading state', () => {
    (useGetProjectQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    (useGetProjectTasksQuery as jest.Mock).mockReturnValue({
      data: emptyTasks,
      isLoading: false,
      isFetching: false,
    });

    renderWithProviders(<ProjectDetailsPage />);
    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useGetProjectQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    (useGetProjectTasksQuery as jest.Mock).mockReturnValue({
      data: emptyTasks,
      isLoading: false,
      isFetching: false,
    });

    renderWithProviders(<ProjectDetailsPage />);
    expect(screen.getByText(/проект не найден/i)).toBeInTheDocument();
  });

  it('renders project details', () => {
    (useGetProjectQuery as jest.Mock).mockReturnValue({
      data: mockProject,
      isLoading: false,
      isError: false,
    });
    (useGetProjectTasksQuery as jest.Mock).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isFetching: false,
    });

    renderWithProviders(<ProjectDetailsPage />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText(/0 из 1 задач/)).toBeInTheDocument();
  });

  it('filters tasks by priority', () => {
    (useGetProjectQuery as jest.Mock).mockReturnValue({
      data: mockProject,
      isLoading: false,
      isError: false,
    });
    (useGetProjectTasksQuery as jest.Mock).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isFetching: false,
    });

    renderWithProviders(<ProjectDetailsPage />);
    const priorityBtn = screen.getByRole('button', { name: /Приоритет/i });
    fireEvent.click(priorityBtn);

    const highBtn = screen.getByText('Высокий', { selector: 'button' });
    fireEvent.click(highBtn);

    expect(screen.getAllByText('Высокий').length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to create task', () => {
    (useGetProjectQuery as jest.Mock).mockReturnValue({
      data: mockProject,
      isLoading: false,
      isError: false,
    });
    (useGetProjectTasksQuery as jest.Mock).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isFetching: false,
    });

    renderWithProviders(<ProjectDetailsPage />);
    const addBtn = screen.getByText(/добавить задачу/i);
    expect(addBtn).toBeInTheDocument();
  });
});
