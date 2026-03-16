export interface AuditLog {
    id: string
    event_id: string
    event_version: number
    event_type: string
    service_source: string
    user_id?: string
    correlation_id?: string
    ip_address?: string
    user_agent?: string
    http_method?: string
    endpoint?: string
    payload: any
    timestamp: string
    created_at: string
}

export interface AuditLogListResponse {
    items: AuditLog[]
    total: number
    skip: number
    limit: number
}
