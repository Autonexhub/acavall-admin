import { z } from 'zod';

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// Therapist schema
export const therapistSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  specialty: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  is_active: z.boolean().default(true),
  entity_ids: z.array(z.number()).optional(),
});

// Session schema
export const sessionSchema = z.object({
  entity_id: z.number({ required_error: 'La entidad es obligatoria' }),
  project_id: z.number({ required_error: 'El proyecto es obligatorio' }),
  date: z.string().min(1, 'La fecha es obligatoria'),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida'),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida'),
  hours: z.number().min(0.1, 'Las horas deben ser mayores a 0'),
  participants: z.number().min(0).optional(),
  notes: z.string().optional(),
  type: z.enum(['regular', 'festivo', 'special']).default('regular'),
  therapist_ids: z.array(z.number()).min(1, 'Debe asignar al menos un terapeuta'),
});

// Entity schema
export const entitySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color hexadecimal inválido').default('#3B82F6'),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cif_nif: z.string().optional(),
  fiscal_address: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  notes: z.string().optional(),
});

// User schema
export const userSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'coordinator', 'therapist']).default('therapist'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
});

// Project schema
export const projectSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  num_sessions: z.number().min(0).default(0),
  beneficiaries: z.number().min(0).default(0),
  amount: z.number().min(0).default(0),
  type: z.enum(['public_subsidy', 'private_subsidy']).default('private_subsidy'),
  budget_number: z.string().optional(),
  budget_link: z.string().url('URL inválida').optional().or(z.literal('')),
  notes: z.string().optional(),
  entity_ids: z.array(z.number()).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type TherapistFormData = z.infer<typeof therapistSchema>;
export type SessionFormData = z.infer<typeof sessionSchema>;
export type EntityFormData = z.infer<typeof entitySchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
