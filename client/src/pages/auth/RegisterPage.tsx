import { Box } from '@mui/material';
import HeaderForUnauthorized from '../../layouts/HeaderForUnauthorized';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../../features/auth/authApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../entities/auth/validation';
import type { RegisterFormValues } from '../../types';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [registerUser, { isLoading, error }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const { repeatPassword, ...credentials } = data;
      const res = await registerUser(credentials).unwrap();
      dispatch(setCredentials(res));
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="relative min-h-[calc(100vh-3.25rem)] text-xl my-[1.625rem] mx-4 md:mx-[3rem] rounded-[1rem] overflow-hidden">
      <div className="absolute inset-0 bg-[url('/auth-bg.webp')] bg-cover bg-top bg-no-repeat opacity-80 -z-10" />

      <div className="relative py-[1.7rem] px-[1.6rem] text-[#2F3A34]">
        <HeaderForUnauthorized />
        <img src="/logo-eirene.svg" alt="Eirene logo" className="w-[11.5rem] h-[4.8rem] mx-auto" />

        <Box className="min-h-[14rem] w-full max-w-[36rem] bg-white mx-auto px-4 md:px-14 pt-4 pb-6 rounded-[1.25rem] mt-4">
          <form className="w-[100%]" onSubmit={handleSubmit(onSubmit)} noValidate>
            <h1 className="text-[1.65rem] mb-[0.75rem] text-center">Регистрация</h1>
            <div className="flex flex-col mb-4">
              <label htmlFor="name" className="ml-[0.5rem] text-base font-medium">
                1. Имя
              </label>
              <div className="relative">
                <img
                  src="/user-icon.svg"
                  alt=""
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                />

                <input
                  id="name"
                  type="text"
                  placeholder="Введите ваше имя"
                  {...register('name')}
                  className="border-[#F0F1F2] border-2 rounded-[0.5rem] h-11 w-full pl-12 pr-4 placeholder-[#767676] text-base focus:outline-none focus:border-[#8CA693] transition"
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col mb-4">
              <label htmlFor="surname" className="ml-[0.5rem] text-base font-medium">
                2. Фамилия
              </label>
              <div className="relative">
                <img
                  src="/user-icon.svg"
                  alt=""
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                />

                <input
                  id="surname"
                  type="text"
                  placeholder="Введите вашу фамилию"
                  {...register('surname')}
                  className="border-[#F0F1F2] border-2 rounded-[0.5rem] h-11 w-full pl-12 pr-4 placeholder-[#767676] text-base focus:outline-none focus:border-[#8CA693] transition"
                />
              </div>
              {errors.surname && (
                <p className="text-red-500 text-sm mt-1">{errors.surname.message}</p>
              )}
            </div>

            <div className="flex flex-col mb-4">
              <label htmlFor="email" className="ml-[0.5rem] text-base font-medium">
                3. E-mail
              </label>
              <div className="relative">
                <img
                  src="/email-icon.svg"
                  alt=""
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                />

                <input
                  id="email"
                  type="email"
                  placeholder="Пример: name@mail.ru"
                  {...register('email')}
                  className="border-[#F0F1F2] border-2 rounded-[0.5rem] h-11 w-full pl-12 pr-4 placeholder-[#767676] text-base focus:outline-none focus:border-[#8CA693] transition"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col mb-4">
              <label htmlFor="password" className="ml-[0.5rem] text-base font-medium">
                4. Придумайте пароль
              </label>
              <div className="relative">
                <img
                  src="/password-icon.svg"
                  alt=""
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                />

                <input
                  id="password"
                  type="password"
                  placeholder="Минимум 6 символов"
                  {...register('password')}
                  className="border-[#F0F1F2] border-2 rounded-[0.5rem] h-11 w-full pl-12 pr-4 placeholder-[#767676] text-base focus:outline-none focus:border-[#8CA693] transition"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label htmlFor="repeatPassword" className="ml-[0.5rem] text-base font-medium">
                5. Повторите пароль
              </label>
              <div className="relative">
                <img
                  src="/password-icon.svg"
                  alt=""
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                />
                <input
                  id="repeatPassword"
                  type="password"
                  placeholder="Повторите пароль"
                  {...register('repeatPassword')}
                  className="border-[#F0F1F2] border-2 rounded-[0.5rem] w-full h-11 pl-12 pr-4 placeholder-[#767676] text-base focus:outline-none focus:border-[#8CA693] transition"
                />
              </div>
              {errors.repeatPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.repeatPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="w-[100%] my-6 text-lg flex items-center font-medium justify-center h-[3rem] text-white bg-[#8CA693] rounded-[0.625rem]"
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          {error && (
            <p className="text-red-500 text-sm text-center mb-4">
              {typeof error === 'object' && error !== null && 'data' in error
                ? (error as any).data?.error?.[0]?.message || 'Ошибка валидации'
                : 'Ошибка подключения к серверу'}
            </p>
          )}
          <div className="bg-[#D9D9D9] w-[100%] h-[1px] mb-6"></div>
          <div className="text-center">
            <span className="text-base">
              Уже есть аккаунт?
              <Link to={'/login'} className="ml-2 text-[#8CA693]">
                Войти
              </Link>
            </span>
          </div>
        </Box>
      </div>
    </div>
  );
}
