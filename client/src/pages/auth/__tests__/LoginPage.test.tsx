import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoginPage from '../LoginPage';
import { useLoginMutation } from '../../../features/auth/authApi';

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

jest.mock('../../../features/auth/authApi');

const mockStore = configureStore({
  reducer: {
    auth: (state = { user: null, accessToken: null }) => state,
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    (useLoginMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValue({}),
      { isLoading: false },
    ]);
    renderWithProviders(<LoginPage />);

    expect(screen.getByPlaceholderText(/почту/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    (useLoginMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValue({}),
      { isLoading: false },
    ]);
    renderWithProviders(<LoginPage />);

    const submitBtn = screen.getByRole('button', { name: /войти/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/введите корректный e-mail/i)).toBeInTheDocument();
      expect(screen.getByText(/минимум 6 символов/i)).toBeInTheDocument();
    });
  });

  it('calls login API with valid credentials', async () => {
    const mockLogin = jest.fn().mockResolvedValue({ data: { user: {}, accessToken: 'token' } });
    (useLoginMutation as jest.Mock).mockReturnValue([mockLogin, { isLoading: false }]);

    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/почту/i), { target: { value: 'test@mail.com' } });
    fireEvent.change(screen.getByPlaceholderText(/пароль/i), { target: { value: '123456' } });

    const submitBtn = screen.getByRole('button', { name: /войти/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ email: 'test@mail.com', password: '123456' });
    });
  });
});
