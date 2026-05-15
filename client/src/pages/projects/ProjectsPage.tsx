import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProjectsQuery } from '../../features/projects/projectsApi';
import type { Project } from '../../entities/project/model';

const projectIconConfig = {
  plant: { src: '/project-plant-icon.svg', iconBg: 'bg-[#F0F1F2]' },
  sun: { src: '/project-sun-icon.svg', iconBg: 'bg-[#FFEFD3]' },
  waves: { src: '/project-waves-icon.svg', iconBg: 'bg-[#E9F0F9]' },
  star: { src: '/project-star-icon.svg', iconBg: 'bg-[#F5F3FF]' },
  mountains: { src: '/project-mountains-icon.svg', iconBg: 'bg-[#EDD7C9]' },
  flower: { src: '/project-flower-icon.svg', iconBg: 'bg-[#FFC9C9]' },
};

const ITEMS_PER_PAGE = 6;

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useGetProjectsQuery();
  const [search, setSearch] = useState('');
  const [displayedProjects, setDisplayedProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => project.title.toLowerCase().includes(search.toLowerCase()));
  }, [projects, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    const end = page * ITEMS_PER_PAGE;
    const newDisplayed = filteredProjects.slice(0, end);

    setDisplayedProjects((prev) => {
      if (
        prev.length === newDisplayed.length &&
        prev.every((p, i) => p._id === newDisplayed[i]?._id)
      ) {
        return prev;
      }
      return newDisplayed;
    });
  }, [filteredProjects, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedProjects.length < filteredProjects.length) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [displayedProjects.length, filteredProjects.length]);

  return (
    <div className="px-5 md:px-8 pb-4 h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="w-full">
        <h1 className="text-2xl text-[#2F3A34] mb-3">Проекты</h1>
        <p className="text-sm text-[#6F7D75] mb-4">Проектов всего: {projects.length}</p>

        <div className="mb-4">
          <div className="flex flex-col md:flex-row gap-24">
            <div className="flex-1 relative">
              <img
                src="/search2-icon.svg"
                alt=""
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск проектов"
                className="w-full pl-14 pr-4 py-3 bg-white rounded-[0.625rem] border-2 border-[#F0F1F2] text-sm placeholder-[#767676] focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all"
              />
            </div>
            <button
              onClick={() => navigate('/projects/create')}
              className="px-8 py-2.5 bg-[#8CA693] shadow-[0_6px_20px_0_rgba(0,0,0,0.1)] text-white rounded-xl text-sm font-medium hover:bg-[#7A9181] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <img src="/add-icon.svg" alt="" className="w-3.5 h-3.5" />
              Создать проект
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8CA693]"></div>
          </div>
        ) : displayedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProjects.map((project) => {
              const iconData = projectIconConfig[project.icon] || projectIconConfig.plant;
              const lastUpdate = project.updatedAt
                ? new Date(project.updatedAt).toLocaleDateString('ru-RU')
                : '...';

              return (
                <div
                  key={project._id}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="group bg-white py-5 px-7 rounded-[1.5rem] shadow-[0_6px_20px_rgb(0,0,0,0.05)] transition-all cursor-pointer flex flex-col border border-transparent hover:border-[#8CA693]/25"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-2xl ${iconData.iconBg} flex items-center justify-center shrink-0`}
                      >
                        <img src={iconData.src} alt="" className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3
                          className="font-medium text-[#2F3A34] text-lg group-hover:text-[#8CA693] transition-colors truncate"
                          title={project.title}
                        >
                          {project.title}
                        </h3>
                        <p className="text-xs text-[#6F7D75] truncate">
                          Последнее обновление: {lastUpdate}
                        </p>
                      </div>
                    </div>
                  </div>

                  {project.description && (
                    <p
                      className="text-sm text-[#6F7D75] mb-4 flex-1 min-w-0 truncate"
                      title={project.description}
                    >
                      Описание:
                      <span className="text-[#2F3A34] font-medium ml-1">{project.description}</span>
                    </p>
                  )}

                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-[#6F7D75] truncate">
                        Всего задач: {project.totalTasks || 0}
                      </span>
                      <span className="text-[#8CA693] font-medium">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#F0F1F2] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#8CA693] transition-all duration-500"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                    <div className="text-center p-2 font-medium text-[#4C95E9] border border-[#4C95E9] rounded-lg">
                      <div className="truncate text-base">{project.todoTasks || 0}</div>
                      <div className="text-xs">Ожидают</div>
                    </div>
                    <div className="text-center p-2 font-medium text-[#FFC65C] border border-[#FFC65C] rounded-lg">
                      <div className="truncate text-base">{project.inProgressTasks || 0}</div>
                      <div className="text-xs">В работе</div>
                    </div>
                    <div className="text-center p-2 font-medium text-[#8CA693] border border-[#8CA693] rounded-lg">
                      <div className="truncate text-base">{project.completedTasks || 0}</div>
                      <div className="text-xs">Завершено</div>
                    </div>
                  </div>

                  <div className="pt-4 mt-auto border-t border-[#F0F1F2] flex items-center justify-between text-[#A0AEC0]">
                    <span className="text-xs truncate">
                      {new Date(project.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                    <div className="flex items-center gap-1 text-[#8CA693] opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-medium">Открыть проект</span>
                      <img src="/arrow-right-green.svg" alt="" className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 rounded-3xl">
            <img
              src="/empty-projects-icon.svg"
              alt=""
              className="w-24 h-24 mx-auto mb-4 opacity-75"
            />
            <p className="text-[#6F7D75] font-medium">
              {search ? 'Проекты не найдены' : 'У вас пока нет проектов'}
            </p>
          </div>
        )}

        {displayedProjects.length < filteredProjects.length && (
          <div ref={observerTarget} className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8CA693]"></div>
          </div>
        )}
      </div>
    </div>
  );
}
