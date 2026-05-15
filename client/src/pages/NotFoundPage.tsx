import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-[#8CA693]/20 rounded-full blur-3xl transform scale-150"></div>
          <span className="relative text-9xl font-bold text-[#8CA693] leading-none tracking-tight select-none">
            404
          </span>
        </div>

        <h1 className="text-2xl font-medium text-[#2F3A34] mb-3">Страница не найдена</h1>
        <p className="text-[#6F7D75] mb-10 leading-relaxed">
          Проверьте ссылку или вернитесь на дашборд, чтобы продолжить работу.
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-[#8CA693] text-white rounded-xl text-sm font-medium hover:bg-[#7A9181] transition-all shadow-[0_6px_20px_0_rgba(140,166,147,0.3)] hover:shadow-[0_8px_25px_0_rgba(140,166,147,0.4)] active:scale-95 focus:outline-none"
        >
          На дашборд
        </button>
      </div>
    </div>
  );
}
