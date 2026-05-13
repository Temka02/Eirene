export interface Project {
  _id: string;
  title: string;
  description?: string;
  icon: 'plant' | 'sun' | 'waves' | 'star' | 'mountains' | 'flower';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  title: string;
  description?: string;
  icon?: 'plant' | 'sun' | 'waves' | 'star' | 'mountains' | 'flower';
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
  icon?: 'plant' | 'sun' | 'waves' | 'star' | 'mountains' | 'flower';
}
