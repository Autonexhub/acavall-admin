import type { User } from '@/types/auth';
import type { Permission, Resource, Action } from '@/types/permissions';
import { ROLE_PERMISSIONS } from '@/types/permissions';

// Phase 1: Hardcoded permission checking
export function hasPermission(
  user: User | null,
  resource: Resource,
  action: Action
): boolean {
  if (!user) return false;

  const permission: Permission = `${resource}.${action}`;
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];

  return userPermissions.includes(permission);
}

export function canView(user: User | null, resource: Resource): boolean {
  return hasPermission(user, resource, 'view');
}

export function canCreate(user: User | null, resource: Resource): boolean {
  // Admin can always create
  if (user?.role === 'admin') return true;

  return hasPermission(user, resource, 'create');
}

export function canEdit(user: User | null, resource: Resource): boolean {
  // Admin can always edit
  if (user?.role === 'admin') return true;

  return hasPermission(user, resource, 'edit');
}

export function canDelete(user: User | null, resource: Resource): boolean {
  // Admin can always delete
  if (user?.role === 'admin') return true;

  return hasPermission(user, resource, 'delete');
}

// Check if user is admin
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

// Check if user is coordinator or admin
export function isCoordinatorOrAdmin(user: User | null): boolean {
  return user?.role === 'admin' || user?.role === 'coordinator';
}
