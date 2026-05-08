import { Link } from 'react-router-dom';
import HeaderForUnauthorized from '../../layouts/HeaderForUnauthorized';

export default function LandingPage() {
  return (
    <div className="relative min-h-[calc(100vh-3.25rem)] my-4 md:my-[1.625rem] mx-4 md:mx-[3rem] rounded-[1rem] overflow-hidden">
      <div className="absolute inset-0 bg-[url('/auth-bg.svg')] bg-cover bg-top bg-no-repeat opacity-80 -z-10 max-w-[1920px] mx-auto" />

      <div className="relative py-[1.7rem] px-[1.6rem]">
        <HeaderForUnauthorized />
        <main className="flex items-center justify-center mt-2 flex-col text-[#2F3A34]">
          <img src="/logo-eirene.svg" alt="Eirene logo" className="w-[11.5rem] h-[4.8rem]" />
          <h1 className="mt-1 text-[2.1rem]">Управляйте задачами со спокойствием</h1>
          <section className="max-w-[26rem] flex flex-col items-start gap-6 mt-3 mx-auto">
            <div className="h-[3.8rem] flex gap-6">
              <div className="w-[3.8rem] h-[3.825rem] bg-white flex items-center justify-center rounded-[0.625rem]">
                <img src="/document-img.svg" alt="" />
              </div>
              <div className="flex flex-col text-lg justify-center">
                <span>Порядок без стресса</span>
                <span>Умный дашборд и удобные списки</span>
              </div>
            </div>
            <div className="h-[3.8rem] flex gap-6">
              <div className="w-[3.8rem] h-[3.825rem] bg-white flex items-center justify-center rounded-[0.625rem]">
                <img src="/rotate-img.svg" alt="" />
              </div>
              <div className="flex flex-col text-lg justify-center">
                <span>Автоматическая приоритизация задач</span>
                <span>Сосредоточься на главном</span>
              </div>
            </div>
            <div className="h-[3.8rem] flex gap-6">
              <div className="w-[3.8rem] h-[3.825rem] bg-white flex items-center justify-center rounded-[0.625rem]">
                <img src="/diagram-img.svg" alt="" />
              </div>
              <div className="flex flex-col text-lg justify-center">
                <span>Отслеживание прогресса</span>
                <span>Все задачи под твоим контролем</span>
              </div>
            </div>
          </section>
          <Link
            to={'/login'}
            className="flex items-center font-medium justify-center w-full max-w-[28rem] h-12 mt-8 text-white bg-[#8CA693] rounded-[0.3125rem] text-lg"
          >
            Начать бесплатно
          </Link>
        </main>
      </div>
    </div>
  );
}
