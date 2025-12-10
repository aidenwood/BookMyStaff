export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PipedriveActivity {
  id: number
  subject: string
  type: string
  due_date: string
  due_time: string
  duration: string
  note?: string
  user_id: number
  person_id?: number
  org_id?: number
  deal_id?: number
  custom_fields?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface PipedriveOrganization {
  id: number
  name: string
  address?: string
  phone?: string
  email?: string
  website?: string
  custom_fields?: Record<string, any>
}

export interface PipedrivePerson {
  id: number
  name: string
  email: string
  phone?: string
  org_id?: number
  custom_fields?: Record<string, any>
}