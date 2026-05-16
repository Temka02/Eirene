import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import HeaderForAuthorized from '../HeaderForAuthorized';
import { useLogoutMutation } from '../../features/auth/authApi';
import { useGetNotificationsQuery } from '../../features/notifications/notificationsApi';

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

jest.mock('../../features/auth/authApi');
jest.mock('../../features/notifications/notificationsApi');

const createMockStore = (user: any) =>
  configureStore({
    reducer: {
      auth: (state = { user, accessToken: 'token' }) => state,
    },
  });

const renderWithProviders = (ui: React.ReactElement, user: any) => {
  return render(
    <Provider store={createMockStore(user)}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  );
};

describe('HeaderForAuthorized', () => {
  const mockUser = { name: 'Артём', surname: 'Иванов', email: 'artem@test.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useGetNotificationsQuery as jest.Mock).mockReturnValue({
      data: { total: 0 },
      isLoading: false,
    });
    (useLogoutMutation as jest.Mock).mockReturnValue([jest.fn(), { isLoading: false }]);
  });

  it('renders user name and avatar placeholder', () => {
    renderWithProviders(<HeaderForAuthorized />, mockUser);
    expect(screen.getByText('Артём')).toBeInTheDocument();
    expect(screen.getByText('АИ')).toBeInTheDocument();
  });

  it('renders notification and settings buttons', () => {
    renderWithProviders(<HeaderForAuthorized />, mockUser);
    expect(screen.getByLabelText(/уведомления/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/настройки/i)).toBeInTheDocument();
  });
});
