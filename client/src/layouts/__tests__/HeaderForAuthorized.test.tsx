import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HeaderForAuthorized from '../HeaderForAuthorized';
import { useGetMeQuery } from '../../features/auth/authApi';
import { useGetNotificationsQuery } from '../../features/notifications/notificationsApi';

jest.mock('../../features/auth/authApi');
jest.mock('../../features/notifications/notificationsApi');

jest.mock('../../api/apiClient', () => ({
  __esModule: true,
  default: {
    create: () => ({
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
    }),
  },
}));

describe('HeaderForAuthorized', () => {
  const mockUserData = {
    user: {
      id: '1',
      name: 'Артем',
      surname: 'Степанов',
      email: 'artem@test.com',
      emailNotifications: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useGetMeQuery as jest.Mock).mockReturnValue({
      data: mockUserData,
      isLoading: false,
      error: null,
    });

    (useGetNotificationsQuery as jest.Mock).mockReturnValue({
      data: { total: 0 },
      isLoading: false,
    });
  });

  it('renders user name and avatar placeholder', () => {
    render(
      <MemoryRouter>
        <HeaderForAuthorized />
      </MemoryRouter>
    );

    expect(screen.getByText('Артем')).toBeInTheDocument();
    expect(screen.getByText('АС')).toBeInTheDocument();
  });

  it('renders notification and settings buttons', () => {
    render(
      <MemoryRouter>
        <HeaderForAuthorized />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/уведомления/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/настройки/i)).toBeInTheDocument();
  });
});
