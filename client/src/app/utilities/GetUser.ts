import { User } from '../interfaces/user.interface';

export function getUser(): User | null {
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  return JSON.parse(userData) as User;
}
