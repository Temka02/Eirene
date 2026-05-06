import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="flex items-start w-screen h-screen">
      <aside aria-label="Main navigation">Боковое меню</aside>
      <main>
        <header>
          Тут будет иконка уведомлений, строка поиска, иконка с инициалами, имя и фамилия
          пользователя и будут открываться настройки
        </header>
        <Outlet />
      </main>
    </div>
  );
}
