import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Дашборд', icon: 'dashboard' },
  { path: '/notifications', label: 'Уведомления', icon: 'notifications' },
  { path: '/calendar', label: 'Календарь', icon: 'calendar' },
  { path: '/tasks', label: 'Задачи', icon: 'tasks' },
  { path: '/projects', label: 'Проекты', icon: 'projects' },
];

const IconImages = {
  dashboard: '/dashboard-icon.svg',
  notifications: '/notifications-icon.svg',
  calendar: '/calendar-icon.svg',
  tasks: '/tasks-icon.svg',
  projects: '/projects-icon.svg',
};

const Icon = ({
  name,
  className = 'w-5 h-5 -translate-y-[1px]',
}: {
  name: string;
  className?: string;
}) => <img src={IconImages[name as keyof typeof IconImages]} alt="" className={className} />;

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`relative min-h-[calc(100vh-3.25rem)] h-full bg-white flex flex-col transition-all duration-300 ease-in-out pt-5 ${
        isCollapsed ? 'w-20' : 'w-56'
      }`}
    >
      {!isCollapsed && <img src="/logo-eirene.svg" alt="Eirene" className="mx-auto h-10 mb-5" />}

      <nav className="flex-1 py-2.5 px-5 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`h-11 flex items-center gap-3 px-3 py-2.5 rounded-[0.625rem] transition-all duration-200 text-[#5F6F65] font-medium ${
                isActive ? 'bg-[#F0F3ED]' : 'hover:bg-[#F0F3ED]/70'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <span className={`flex-shrink-0 `}>
                <Icon name={item.icon} />
              </span>
              {!isCollapsed && <span className="truncate h-5 leading-tight">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="h-48 mx-4 mb-6 rounded-[1.25rem] bg-cover bg-center relative overflow-hidden bg-[url('/mountains-bg.jpg')]">
          <div className="flex flex-col h-[50%] top-[50%] absolute w-full bg-gradient-to-t from-[#DCE6DD] to-[#E8F0E9] opacity-80">
            <div className="p-3 ">
              <p className="text-[#8CA693] text-[0.95rem] font-medium">
                Фокус на важном,
                <br />
                спокойствие в каждом
                <br />
                действии
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pb-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[#5F6F65] hover:bg-[#F0F3ED]/70 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <img
            src="/asideArrow-icon.svg"
            alt=""
            className={`transition-transform duration-300 h-3 w-2 ${isCollapsed ? 'rotate-180' : ''} `}
          />
          {!isCollapsed && <span className="text-base h-5 leading-tight">Свернуть меню</span>}
        </button>
      </div>
    </aside>
  );
}
