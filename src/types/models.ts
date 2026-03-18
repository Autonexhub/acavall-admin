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
  staff_type: 'personal_laboral' | 'personal_apoyo' | 'personal_voluntariado';
  email?: string;
  phone?: string;
  dni?: string;
  social_security_number?: string;
  account_number?: string;
  fiscal_address?: string;
  notes?: string;
  has_dni_photo: boolean;
  has_certificate_delitos: boolean;
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
  type: 'perros' | 'gatos' | 'caballos' | 'sin_animales' | 'entorno_natural';
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
  type: 'ocio' | 'educacion' | 'terapia' | 'voluntariado' | 'formacion' | 'otros';
  funding_type: 'public_subsidy' | 'private_subsidy' | 'financiacion_propia';
  beneficiary_type: 'discapacidad_sensorial' | 'discapacidad_intelectual' | 'discapacidad_fisica_organica' | 'discapacidad_psicosocial' | 'personas_mayores' | 'mujeres_victimas_violencia' | 'menores_riesgo' | 'infancia_juventud' | 'cuidadores_familias' | 'otros';
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
