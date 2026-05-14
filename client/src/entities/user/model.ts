export interface User {
  _id: string;
  email: string;
  name: string;
  surname: string;
  emailNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMeDto {
  name?: string;
  surname?: string;
  email?: string;
  emailNotifications?: boolean;
}
