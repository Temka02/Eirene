import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SettingsPage from '../SettingsPage';
import { useGetMeQuery, useUpdateMeMutation } from '../../../features/auth/authApi';

jest.mock('../../../api/apiClient', () => ({
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

jest.mock('../../../features/auth/authApi', () => ({
  useGetMeQuery: jest.fn(),
  useUpdateMeMutation: jest.fn(() => [
    jest.fn().mockResolvedValue({ data: {} }),
    { isLoading: false },
  ]),
  useLogoutMutation: jest.fn(() => [
    jest.fn().mockResolvedValue({ data: {} }),
    { isLoading: false },
  ]),
}));

interface InitialState {
  user: any | null;
  accessToken: string | null;
  isInitialized: boolean;
}

const createMockStore = (preloadedState: { auth?: Partial<InitialState> } = {}) =>
  configureStore({
    reducer: {
      auth: (state: InitialState = { user: null, accessToken: null, isInitialized: false }) => ({
        ...state,
        ...preloadedState.auth,
      }),
    },
  });

const renderWithProviders = (ui: React.ReactElement, store = createMockStore()) => {
  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  );
};

describe('SettingsPage', () => {
  const mockUser = {
    _id: 'user-123',
    name: 'Артем',
    surname: 'Иванов',
    email: 'artem@example.com',
    emailNotifications: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    (useGetMeQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderWithProviders(<SettingsPage />);
    expect(screen.getByText(/загрузка\.\.\./i)).toBeInTheDocument();
  });

  it('renders profile form with user data', () => {
    (useGetMeQuery as jest.Mock).mockReturnValue({
      data: { user: mockUser },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<SettingsPage />);
    expect(screen.getByLabelText(/имя/i)).toHaveValue('Артем');
    expect(screen.getByLabelText(/фамилия/i)).toHaveValue('Иванов');
    expect(screen.getByLabelText(/email/i)).toHaveValue('artem@example.com');
  });

  it('renders notifications toggle', () => {
    (useGetMeQuery as jest.Mock).mockReturnValue({
      data: { user: mockUser },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<SettingsPage />);
    expect(screen.getByText(/email-рассылка/i)).toBeInTheDocument();
  });

  it('renders logout button', () => {
    (useGetMeQuery as jest.Mock).mockReturnValue({
      data: { user: mockUser },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<SettingsPage />);
    expect(screen.getByText(/выйти из аккаунта/i)).toBeInTheDocument();
  });

  it('submits profile form', async () => {
    const mockUpdate = jest.fn().mockResolvedValue({ data: {} });
    (useGetMeQuery as jest.Mock).mockReturnValue({
      data: { user: mockUser },
      isLoading: false,
      isError: false,
    });
    (useUpdateMeMutation as jest.Mock).mockReturnValue([mockUpdate, { isLoading: false }]);

    renderWithProviders(<SettingsPage />);
    const submitBtn = screen.getByRole('button', { name: /сохранить изменения/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
    });
  });
});
