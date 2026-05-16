import authReducer, {
  setCredentials,
  logout,
  initialize,
  setUser,
  setLoading,
  setError,
  updateAccessToken,
} from '../authSlice';
beforeEach(() => {
  localStorage.clear();
});

describe('authSlice', () => {
  const mockUser = {
    _id: '1',
    email: 'artem@test.com',
    name: 'Артем',
    surname: '',
    emailNotifications: true,
    createdAt: '2026-05-16T00:00:00.000Z',
    updatedAt: '2026-05-16T00:00:00.000Z',
  };
  const mockToken = 'fake-jwt-token';

  it('возвращает начальное состояние по умолчанию', () => {
    const newState = authReducer(undefined, { type: 'unknown' });

    expect(newState.user).toBeNull();
    expect(newState.accessToken).toBeNull();
    expect(newState.isInitialized).toBe(false);
  });

  it('устанавливает кредиты при входе (setCredentials)', () => {
    const initialState = authReducer(undefined, { type: 'unknown' });

    const newState = authReducer(
      initialState,
      setCredentials({
        user: mockUser,
        accessToken: mockToken,
      })
    );

    expect(newState.user).toEqual(mockUser);
    expect(newState.accessToken).toBe(mockToken);
    expect(localStorage.getItem('accessToken')).toBe(mockToken);
  });

  it('очищает стейт при выходе (logout)', () => {
    const loggedInState = authReducer(
      undefined,
      setCredentials({
        user: mockUser,
        accessToken: mockToken,
      })
    );

    const newState = authReducer(loggedInState, logout());

    expect(newState.user).toBeNull();
    expect(newState.accessToken).toBeNull();
    expect(newState.isInitialized).toBe(true);
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('инициализирует токен из localStorage (initialize)', () => {
    localStorage.setItem('accessToken', 'existing-token');

    const initialState = authReducer(undefined, { type: 'unknown' });
    const newState = authReducer(initialState, initialize());

    expect(newState.accessToken).toBe('existing-token');
    expect(newState.isInitialized).toBe(true);
  });

  it('обновляет пользователя (setUser)', () => {
    const initialState = authReducer(undefined, { type: 'unknown' });
    const newUser = { ...mockUser, name: 'Updated' };
    const newState = authReducer(initialState, setUser(newUser));

    expect(newState.user).toEqual(newUser);
  });

  it('устанавливает isLoading (setLoading)', () => {
    const initialState = authReducer(undefined, { type: 'unknown' });
    const newState = authReducer(initialState, setLoading(true));

    expect(newState.isLoading).toBe(true);
  });

  it('устанавливает ошибку (setError)', () => {
    const initialState = authReducer(undefined, { type: 'unknown' });
    const newState = authReducer(initialState, setError('Test error'));

    expect(newState.error).toBe('Test error');
  });

  it('обновляет токен (updateAccessToken)', () => {
    const initialState = authReducer(undefined, { type: 'unknown' });
    const newToken = 'new-token-123';
    const newState = authReducer(initialState, updateAccessToken(newToken));

    expect(newState.accessToken).toBe(newToken);
    expect(localStorage.getItem('accessToken')).toBe(newToken);
  });
});
