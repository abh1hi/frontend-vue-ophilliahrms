// Common envelope, pagination, error, and base model types

export interface ApiResponse<T = any> {
    success: boolean
    data: T | null
    meta: ApiMeta | null
    error: ApiError | null
}

export interface ApiMeta {
    page?: number
    page_size?: number
    total_items?: number
    total_pages?: number
    [key: string]: any
}

export interface ApiError {
    code: string
    message: string
    details?: any
}

export interface BaseModel {
    id: string
    created_at: string
    updated_at: string
    created_by?: string
    updated_by?: string
    deleted_at?: string | null
    is_active?: boolean
}
