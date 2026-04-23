// API endpoint constants
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    refresh: '/auth/refresh',
    impersonate: (userId: number) => `/auth/impersonate/${userId}`,
    stopImpersonating: '/auth/stop-impersonating',
    testEmail: '/auth/test-email',
  },

  // Centers
  centers: {
    list: '/centers',
    get: (id: number) => `/centers/${id}`,
    create: '/centers',
    update: (id: number) => `/centers/${id}`,
    delete: (id: number) => `/centers/${id}`,
  },

  // Therapists
  therapists: {
    list: '/therapists',
    get: (id: number) => `/therapists/${id}`,
    create: '/therapists',
    update: (id: number) => `/therapists/${id}`,
    delete: (id: number) => `/therapists/${id}`,
    resendInvite: (id: number) => `/therapists/${id}/resend-invite`,
  },

  // Sessions
  sessions: {
    list: '/sessions',
    get: (id: number) => `/sessions/${id}`,
    create: '/sessions',
    update: (id: number) => `/sessions/${id}`,
    delete: (id: number) => `/sessions/${id}`,
    stats: '/sessions/stats',
  },

  // Residences
  residences: {
    list: '/residences',
    get: (id: number) => `/residences/${id}`,
  },

  // Programs
  programs: {
    list: '/programs',
    get: (id: number) => `/programs/${id}`,
    stats: '/programs/stats',
  },

  // Entities
  entities: {
    list: '/entities',
    get: (id: number) => `/entities/${id}`,
    create: '/entities',
    update: (id: number) => `/entities/${id}`,
    delete: (id: number) => `/entities/${id}`,
  },

  // Users
  users: {
    list: '/users',
    get: (id: number) => `/users/${id}`,
    create: '/users',
    update: (id: number) => `/users/${id}`,
    delete: (id: number) => `/users/${id}`,
  },

  // Projects
  projects: {
    list: '/projects',
    get: (id: number) => `/projects/${id}`,
    create: '/projects',
    update: (id: number) => `/projects/${id}`,
    delete: (id: number) => `/projects/${id}`,
  },

  // Reports
  reports: {
    therapistHours: '/reports/therapist-hours',
    centerSessions: '/reports/center-sessions',
    impact: '/reports/impact',
  },
} as const;
