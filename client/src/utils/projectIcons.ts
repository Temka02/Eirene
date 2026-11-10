export interface ProjectIconConfig {
  src: string;
  iconBg: string;
}

export const PROJECT_ICON_CONFIGS: Record<string, ProjectIconConfig> = {
  plant: { src: '/project-plant-icon.svg', iconBg: 'bg-[#F0F3ED]' },
  sun: { src: '/project-sun-icon.svg', iconBg: 'bg-[#FFF4E5]' },
  waves: { src: '/project-waves-icon.svg', iconBg: 'bg-[#E9F0F9]' },
  star: { src: '/project-star-icon.svg', iconBg: 'bg-[#F5F3FF]' },
  mountains: { src: '/project-mountains-icon.svg', iconBg: 'bg-[#EDD7C9]' },
  flower: { src: '/project-flower-icon.svg', iconBg: 'bg-[#FFC9C9]' },
};

export const getProjectIconConfig = (iconKey: string): ProjectIconConfig => {
  return PROJECT_ICON_CONFIGS[iconKey] || PROJECT_ICON_CONFIGS.plant;
};
