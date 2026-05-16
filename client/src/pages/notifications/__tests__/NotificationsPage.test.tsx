import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import NotificationsPage from '../NotificationsPage';
import { useGetNotificationsQuery } from '../../../features/notifications/notificationsApi';

jest.mock('../../../features/notifications/notificationsApi', () => ({
  useGetNotificationsQuery: jest.fn(),
  useMarkAsReadMutation: jest.fn(() => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) }),
    { isLoading: false },
  ]),
  useMarkAllReadMutation: jest.fn(() => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) }),
    { isLoading: false },
  ]),
  useDeleteNotificationMutation: jest.fn(() => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) }),
    { isLoading: false },
  ]),
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

describe('NotificationsPage', () => {
  const mockNotifications = {
    data: [
      {
        _id: 'n1',
        message: 'Test notification',
        type: 'deadline',
        isRead: false,
        taskId: 't1',
        deadlineType: 'hard',
        deadline: '2026-12-31',
        createdAt: '2026-05-15T10:00:00Z',
      },
    ],
    total: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    (useGetNotificationsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    });
    renderWithProviders(<NotificationsPage />);
    expect(screen.getByText(/уведомления/i)).toBeInTheDocument();
  });

  it('renders empty state', () => {
    (useGetNotificationsQuery as jest.Mock).mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
      isSuccess: true,
    });
    renderWithProviders(<NotificationsPage />);
    expect(screen.getByText(/уведомлений нет/i)).toBeInTheDocument();
  });

  it('renders notifications list', () => {
    (useGetNotificationsQuery as jest.Mock).mockReturnValue({
      data: mockNotifications,
      isLoading: false,
      isSuccess: true,
    });
    renderWithProviders(<NotificationsPage />);
    expect(screen.getByText('Test notification')).toBeInTheDocument();
  });

  it('toggles between all and unread tabs', () => {
    (useGetNotificationsQuery as jest.Mock).mockReturnValue({
      data: mockNotifications,
      isLoading: false,
      isSuccess: true,
    });
    renderWithProviders(<NotificationsPage />);
    const unreadTab = screen.getByText(/непрочитанные/i);
    fireEvent.click(unreadTab);
    expect(unreadTab.closest('button')).toHaveClass('bg-[#F0F3ED]');
  });

  it('filters by notification type', () => {
    (useGetNotificationsQuery as jest.Mock).mockReturnValue({
      data: mockNotifications,
      isLoading: false,
      isSuccess: true,
    });
    renderWithProviders(<NotificationsPage />);

    const allButtons = screen.getAllByRole('button', { name: 'Все' });
    const filterBtn = allButtons[1];

    fireEvent.click(filterBtn);

    const remindersBtn = screen.getByRole('button', { name: 'Напоминания' });
    fireEvent.click(remindersBtn);
    expect(filterBtn).toHaveTextContent('Напоминания');
  });
});
