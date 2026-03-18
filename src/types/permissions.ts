// Permission types (Phase 1: Hardcoded)
export type Resource =
  | 'centers'
  | 'therapists'
  | 'sessions'
  | 'residences'
  | 'programs'
  | 'reports'
  | 'users';

export type Action = 'view' | 'create' | 'edit' | 'delete';

export type Permission = `${Resource}.${Action}`;

// Phase 1: Hardcoded role permissions
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    'centers.view', 'centers.create', 'centers.edit', 'centers.delete',
    'therapists.view', 'therapists.create', 'therapists.edit', 'therapists.delete',
    'sessions.view', 'sessions.create', 'sessions.edit', 'sessions.delete',
    'residences.view', 'residences.create', 'residences.edit', 'residences.delete',
    'programs.view', 'programs.create', 'programs.edit', 'programs.delete',
    'reports.view',
    'users.view', 'users.create', 'users.edit', 'users.delete',
  ],
  coordinator: [
    'centers.view', 'centers.create', 'centers.edit',
    'therapists.view', 'therapists.create', 'therapists.edit',
    'sessions.view', 'sessions.create', 'sessions.edit', 'sessions.delete',
    'residences.view',
    'programs.view',
    'reports.view',
  ],
  therapist: [
    'centers.view',
    'therapists.view',
    'sessions.view', 'sessions.create', 'sessions.edit',
    'residences.view',
    'programs.view',
    'reports.view',
  ],
};
