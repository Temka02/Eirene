import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetMeQuery, useUpdateMeMutation, useLogoutMutation } from '../../features/auth/authApi';
import { logout as logoutAction } from '../../store/authSlice';
import { useDispatch } from 'react-redux';
import { api } from '../../store/api';

export default function SettingsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: meData, isLoading: loadingMe } = useGetMeQuery();
  const user = meData?.user;

  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
  const [logoutApi] = useLogoutMutation();

  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
  });

  const [emailNotifs, setEmailNotifs] = useState(false);

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        surname: user.surname,
        email: user.email,
      });
      setEmailNotifs(user.emailNotifications ?? true);
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!form.name.trim() || !form.surname.trim()) {
      setFormError('Имя и фамилия обязательны');
      return;
    }

    try {
      await updateMe(form).unwrap();
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (err: any) {
      setFormError(err.data?.error || 'Ошибка обновления');
    }
  };

  const handleEmailToggle = async () => {
    const newState = !emailNotifs;
    try {
      setNotifLoading(true);
      setEmailNotifs(newState);
      await updateMe({ emailNotifications: newState }).unwrap();
    } catch {
      setEmailNotifs(!newState);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logoutAction());
      dispatch(api.util.resetApiState());
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loadingMe) return <div className="p-10 text-center">Загрузка...</div>;

  return (
    <div className="px-5 md:px-8 lg:px-11 pb-4 h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="w-full max-w-[800px] mx-auto">
        <h1 className="text-2xl text-[#2F3A34] mb-6">Настройки</h1>

        <div className="space-y-6 mb-4">
          <div className="bg-white rounded-2xl px-10 py-6 shadow-sm">
            <h2 className="text-base font-medium text-[#2F3A34] mb-4">Профиль</h2>

            {formError && (
              <div className="mb-4 p-3 bg-[#FFEDEE] text-[#D32F2F] text-sm rounded-lg">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 p-3 bg-[#E4F0E5] text-[#8CA693] text-sm rounded-lg">
                Профиль обновлен
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#2F3A34] mb-1.5" htmlFor="name">
                    Имя
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-[#F0F1F2] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8CA693]"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium text-[#2F3A34] mb-1.5"
                    htmlFor="surname"
                  >
                    Фамилия
                  </label>
                  <input
                    id="surname"
                    type="text"
                    value={form.surname}
                    onChange={(e) => setForm({ ...form, surname: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-[#F0F1F2] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8CA693]"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium text-[#2F3A34] mb-1.5"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-[#F0F1F2] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8CA693]"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 bg-[#8CA693] text-white rounded-xl text-sm font-medium hover:bg-[#7A9181] disabled:opacity-50"
                >
                  {isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl px-10 py-6 shadow-sm">
            <h2 className="text-base font-medium text-[#2F3A34] mb-4">Уведомления</h2>

            <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#F0F1F2]">
              <div>
                <p className="text-sm font-medium text-[#2F3A34]">Email-рассылка</p>
                <p className="text-xs text-[#6F7D75] mt-0.5">Напоминания о дедлайнах на почту</p>
              </div>
              <button
                onClick={handleEmailToggle}
                disabled={notifLoading}
                className={`w-12 h-6 rounded-full transition-colors relative ${emailNotifs ? 'bg-[#8CA693]' : 'bg-[#D9D9D9]'}`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${emailNotifs ? 'translate-x-6' : 'translate-x-0'}`}
                />
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="bg-white rounded-xl">
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 border bg-[#FFC9C9]/70 text-[#D32F2F] rounded-xl text-sm font-medium hover:bg-[#FFC9C9]/10 transition-colors"
              >
                Выйти из аккаунта
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
