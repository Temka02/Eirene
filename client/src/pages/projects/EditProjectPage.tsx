import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateProjectMutation, useGetProjectQuery } from '../../features/projects/projectsApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, type ProjectFormData } from '../../entities/validation';

type IconType = 'plant' | 'sun' | 'waves' | 'star' | 'mountains' | 'flower';

interface ProjectIcon {
  id: IconType;
  src: string;
  activeBorderColor: string;
  iconBg: string;
}

const icons: ProjectIcon[] = [
  {
    id: 'plant',
    src: '/project-plant-icon.svg',
    activeBorderColor: 'border-[#62977B]',
    iconBg: 'bg-[#F0F1F2]',
  },
  {
    id: 'sun',
    src: '/project-sun-icon.svg',
    activeBorderColor: 'border-[#FFC65C]',
    iconBg: 'bg-[#FFEFD3]',
  },
  {
    id: 'waves',
    src: '/project-waves-icon.svg',
    activeBorderColor: 'border-[#4C95E9]',
    iconBg: 'bg-[#E9F0F9]',
  },
  {
    id: 'star',
    src: '/project-star-icon.svg',
    activeBorderColor: 'border-[#954BA8]',
    iconBg: 'bg-[#F5F3FF]',
  },
  {
    id: 'mountains',
    src: '/project-mountains-icon.svg',
    activeBorderColor: 'border-[#A66E48]',
    iconBg: 'bg-[#EDD7C9]',
  },
  {
    id: 'flower',
    src: '/project-flower-icon.svg',
    activeBorderColor: 'border-[#D9636B]',
    iconBg: 'bg-[#FFC9C9]',
  },
];

export default function EditProjectPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: project, isLoading: isLoadingProject } = useGetProjectQuery(id!);
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: { icon: 'plant' },
  });

  const selectedIcon = watch('icon');

  useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        description: project.description,
        icon: (project.icon as IconType) || 'plant',
      });
    }
  }, [project, reset]);

  const onSubmit = async (data: ProjectFormData) => {
    try {
      await updateProject({
        id: id!,
        title: data.title,
        description: data.description,
        icon: data.icon,
      }).unwrap();
      navigate('/projects');
    } catch (err: any) {
      Sentry.captureException(err);
    }
  };

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-[#6F7D75] text-sm">Загрузка данных...</div>
      </div>
    );
  }

  return (
    <div className="px-5 md:px-8 pb-4 h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="w-full mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/projects')}
            className="w-12 h-9 bg-white rounded-[0.625rem] shadow-[0_6px_20px_0_rgba(0,0,0,0.05)] flex items-center justify-center hover:bg-[#F0F3ED]/70 transition-colors"
          >
            <img src="/sortArrow-icon.svg" alt="Назад" className="w-4 h-4 -rotate-90" />
          </button>
          <h1 className="text-2xl text-[#2F3A34]">Редактировать проект</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl py-4 px-6 shadow-sm mb-4">
            <h2 className="text-base font-medium text-[#2F3A34] ml-4 mb-4 flex items-center gap-2">
              Информация о проекте
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              <div className="space-y-2">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-[#2F3A34] mb-1.5"
                  >
                    Название проекта
                  </label>
                  <div className="relative">
                    <img
                      src="/projects-icon.svg"
                      alt=""
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6F7D75]"
                    />
                    <input
                      id="title"
                      type="text"
                      placeholder="Введите название проекта"
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#F0F1F2] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all"
                      {...register('title')}
                    />
                  </div>
                  {errors.title && (
                    <p className="text-xs text-[#D32F2F] mt-1 ml-2">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-[#2F3A34] mb-1.5"
                  >
                    Описание
                  </label>
                  <div className="relative">
                    <img
                      src="/projects-icon.svg"
                      alt=""
                      className="absolute left-4 top-4 w-5 h-5 text-[#6F7D75]"
                    />
                    <textarea
                      id="description"
                      placeholder="Кратко напишите, о чем ваш проект"
                      rows={7}
                      maxLength={200}
                      className="w-full pl-12 pr-11 py-3 bg-white border-2 border-[#F0F1F2] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all resize-none"
                      {...register('description')}
                    />
                    <span className="absolute bottom-3 right-3 text-sm text-[#A0AEC0]">
                      {watch('description')?.length || 0}/200
                    </span>
                  </div>
                  {errors.description && (
                    <p className="text-xs text-[#D32F2F] mt-1 ml-2">{errors.description.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2F3A34] mb-3">
                  Выберите иконку проекта
                </label>
                <div className="flex items-center justify-start gap-2">
                  {icons.map((icon) => {
                    const isSelected = selectedIcon === icon.id;
                    return (
                      <button
                        key={icon.id}
                        type="button"
                        onClick={() => setValue('icon', icon.id)}
                        className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${icon.iconBg} ${
                          isSelected ? `${icon.activeBorderColor} border-2` : 'border-0'
                        }`}
                      >
                        <img
                          src={icon.src}
                          alt={icon.id}
                          className={`w-6 h-6 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70'}`}
                        />
                        {isSelected && (
                          <img
                            src="/taskDone-icon.svg"
                            alt="Выбрано"
                            className="absolute z-20 -top-3 -right-3 w-5 h-5"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-sm text-[#A0AEC0] leading-tight">
                  Иконка поможет быстро находить ваш проект в списке
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="w-[13.5rem] text-center py-3 bg-white text-[#8CA693] rounded-xl text-sm font-medium hover:bg-[#F0F3ED]/70 transition-colors"
            >
              Отменить
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="w-[13.5rem] text-center py-3 bg-[#8CA693] text-white rounded-xl text-sm font-medium hover:bg-[#7A9181] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_6px_20px_0_rgba(140,166,147,0.4)] transition-all"
            >
              {isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
