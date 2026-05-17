import { Link } from 'react-router-dom';

export default function RegisterBtn() {
  return (
    <Link
      to={'/register'}
      className="flex items-center font-medium justify-center w-[10rem] md:w-[13.5rem] h-[2.75rem] text-white bg-[#8CA693] rounded-[0.3125rem]"
    >
      Зарегистрироваться
    </Link>
  );
}
