import { Link, useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../../features/auth/authApi';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '../../store/authSlice';

export default function SettingsPage() {
  const [logoutMutation, { isLoading }] = useLogoutMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (err) {
      console.error('Ошибка при запросе на сервере:', err);
    } finally {
      dispatch(logoutAction());
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
      <h1 className="text-3xl font-bold text-[#2F3A34]">Настройки</h1>

      <Link to="/dashboard" className="text-lg text-[#8CA693] hover:underline">
        Вернуться на дашборд
      </Link>

      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {isLoading ? 'Выходим...' : 'Выйти из аккаунта'}
      </button>
    </div>
  );
}
