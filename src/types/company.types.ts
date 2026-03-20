export interface Company {
    id: string
    name: string
    domain?: string
    is_active: boolean
    created_at: string
}

export interface CompanyCreate {
    name: string
    domain?: string
}

export interface CompanyListResponse {
    total: number
    companies: Company[]
}
