// API request and response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

// Query parameters
export interface SessionFilters {
  start_date?: string;
  end_date?: string;
  entity_id?: number;
  project_id?: number;
  therapist_id?: number;
  type?: 'regular' | 'festivo' | 'special';
}

export interface ReportParams {
  start_date?: string;
  end_date?: string;
  entity_id?: number;
  therapist_id?: number;
}
