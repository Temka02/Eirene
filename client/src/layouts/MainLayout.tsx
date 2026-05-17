import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import HeaderForAuthorized from './HeaderForAuthorized';
import { Suspense } from 'react';

export default function MainLayout() {
  return (
    <div className="bg-[#FEFCF9] py-4 md:py-[1.625rem] px-4 md:px-[1.4rem]">
      <div className="flex items-start relative bg-white z-0 min-h-[calc(100vh-3.25rem)] rounded-r-[1.25rem] rounded-l-[0.625rem] overflow-hidden shadow-[0_6px_20px_0_rgba(0,0,0,0.1)]">
        <div className="absolute inset-0 bg-[url('/layout-bg.webp')] bg-cover bg-top bg-no-repeat opacity-75 -z-10 rounded-[1.25rem]" />
        <Sidebar />
        <main className="flex-1 w-full flex flex-col overflow-hidden">
          <HeaderForAuthorized />
          <Suspense
            fallback={<div className="flex justify-center p-10 text-[#2F3A34]">Загрузка...</div>}
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
