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

export type NextAction = 'CREATE_COMPANY' | 'SELECT_COMPANY' | 'ENTER_DASHBOARD'

export interface PostLoginContext {
    role: string
    companies?: Company[]
    next_action: NextAction
    selected_company?: string | null
}
