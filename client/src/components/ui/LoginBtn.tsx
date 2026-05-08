import { Link } from 'react-router-dom';

export default function LoginBtn() {
  return (
    <Link
      to={'/login'}
      className="flex items-center font-medium justify-center w-[13.5rem] h-[2.75rem] text-[#2F3A34] bg-white rounded-[0.3125rem]"
    >
      Войти
    </Link>
  );
}
