// Domain models migrated from existing project
export interface WorkHistory {
  id: number;
  therapist_id: number;
  entity_id: number;
  entity_name?: string;
  city?: string;
  province?: string;
  role: string;
  start_date: string;
  end_date?: string | null;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Therapist {
  id: number;
  name: string;
  specialty?: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  hoursWorked?: number;
  entities?: Entity[];
  work_history?: WorkHistory[];
  created_at?: string;
  updated_at?: string;
}

export interface Session {
  id: number;
  entity_id: number;
  project_id: number;
  date: string;
  start_time: string;
  end_time: string;
  hours: number;
  participants?: number;
  notes?: string;
  type: 'regular' | 'festivo' | 'special';
  entity?: Entity;
  entity_name?: string;
  project?: Project;
  project_name?: string;
  therapists?: Therapist[];
  created_at?: string;
  updated_at?: string;
}

export interface Program {
  id: number;
  name: string;
  color: string;
  is_active: boolean;
  entities?: number;
  sessions?: number;
  participants?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Entity {
  id: number;
  name: string;
  color: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  cif_nif?: string;
  fiscal_address?: string;
  postal_code?: string;
  city?: string;
  province?: string;
  notes?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'coordinator' | 'therapist';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  num_sessions: number;
  beneficiaries: number;
  amount: number;
  type: 'public_subsidy' | 'private_subsidy';
  budget_number?: string;
  budget_link?: string;
  notes?: string;
  entities?: Entity[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MonthlyStats {
  totalSessions: number;
  totalHours: number;
  totalParticipants: number;
  activeCenters: number;
  activeTherapists: number;
}
