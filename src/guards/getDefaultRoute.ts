import type { User } from '../contexts/AuthContextTypes';

// Helpers to centralize role/status checks for guards and navigation
export const isOwner = (user: User | null): boolean => user?.role === 'OWNER';

export const isEmployee = (user: User | null): boolean =>
  user?.role === 'EMPLOYEE';

export const isEmployeeActive = (user: User | null): boolean => {
  if (!isEmployee(user)) return false;
  return user?.status?.toUpperCase() === 'ACTIVE';
};

export const isEmployeePending = (user: User | null): boolean => {
  if (!isEmployee(user)) return false;
  return !isEmployeeActive(user);
};

export const getDefaultRouteForUser = (user: User | null): string => {
  if (!user) return '/';
  if (isOwner(user)) return '/home';
  if (isEmployeeActive(user)) return '/home';
  if (isEmployeePending(user)) return '/pending';
  return '/';
};
