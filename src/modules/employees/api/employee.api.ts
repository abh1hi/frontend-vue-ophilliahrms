import apiClient from '@/utils/api-client'
import type { ApiResponse, BaseModel } from '@/types/api.types'

export interface Employee extends BaseModel {
    first_name: string
    last_name: string
    email: string
    phone?: string
    department_id?: string
    status: 'active' | 'inactive' | 'terminated'
    // ... other fields based on specific schema
}

export type CreateEmployeeDto = Omit<Employee, keyof BaseModel>
export type UpdateEmployeeDto = Partial<CreateEmployeeDto>

export const EmployeeService = {
    /**
     * Retrieves a paginated list of employees.
     */
    async getEmployees(params?: { page?: number; page_size?: number; search?: string }): Promise<ApiResponse<Employee[]>> {
        return await apiClient.get('/employees', { params })
    },

    /**
     * Retrieves a single employee by ID.
     */
    async getEmployee(id: string): Promise<ApiResponse<Employee>> {
        return await apiClient.get(`/employees/${id}`)
    },

    /**
     * Creates a new employee.
     */
    async createEmployee(data: CreateEmployeeDto): Promise<ApiResponse<Employee>> {
        return await apiClient.post('/employees', data)
    },

    /**
     * Updates an existing employee.
     */
    async updateEmployee(id: string, data: UpdateEmployeeDto): Promise<ApiResponse<Employee>> {
        return await apiClient.patch(`/employees/${id}`, data)
    },

    /**
     * Deletes an employee.
     */
    async deleteEmployee(id: string): Promise<ApiResponse<null>> {
        return await apiClient.delete(`/employees/${id}`)
    }
}
