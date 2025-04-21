export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  createdAt: Date | null;
  profileImage?: string;
} 