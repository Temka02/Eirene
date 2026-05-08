import { useLocation } from 'react-router-dom';
import LoginBtn from '../components/ui/LoginBtn';
import RegisterBtn from '../components/ui/RegisterBtn';

export default function HeaderForUnauthorized() {
  const { pathname } = useLocation();

  const hideLogin = pathname === '/login';
  const hideRegister = pathname === '/register';

  return (
    <nav className="flex justify-end items-center gap-[1.2rem] text-[1.1rem]">
      {!hideLogin && <LoginBtn />}
      {!hideRegister && <RegisterBtn />}
    </nav>
  );
}
