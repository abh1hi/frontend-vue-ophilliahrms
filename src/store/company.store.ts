import { defineStore } from 'pinia'
import apiClient from '@/utils/api-client'
import type { Company, CompanyCreate, CompanyListResponse } from '@/types/api.types'
import { useToastStore } from './toast.store'

export const useCompanyStore = defineStore('company', {
    state: () => ({
        companies: [] as Company[],
        totalCompanies: 0,
        isLoading: false,
        error: null as string | null,
    }),

    actions: {
        async fetchCompanies() {
            this.isLoading = true
            this.error = null
            try {
                const response: any = await apiClient.get('/auth/companies')
                const data: CompanyListResponse = response.data || response
                this.companies = data.companies
                this.totalCompanies = data.total
            } catch (err: any) {
                this.error = err.error?.message || 'Failed to fetch companies'
                console.error(this.error)
            } finally {
                this.isLoading = false
            }
        },

        async createCompany(companyData: CompanyCreate) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                if (!companyData.domain) delete companyData.domain
                const response: any = await apiClient.post('/auth/companies', companyData)
                const newCompany: Company = response.data || response
                this.companies.unshift(newCompany)
                this.totalCompanies++
                toast.show('Company created successfully', 'success')
                return newCompany
            } catch (err: any) {
                const msg = err.error?.message || 'Failed to create company'
                toast.show(msg, 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async updateCompany(companyId: string, data: { name?: string; domain?: string }) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                const response: any = await apiClient.patch(`/auth/companies/${companyId}`, data)
                const updated: Company = response.data || response
                const index = this.companies.findIndex(c => c.id === companyId)
                if (index !== -1) {
                    this.companies[index] = updated
                }
                toast.show('Company updated successfully', 'success')
                return updated
            } catch (err: any) {
                const msg = err.error?.message || 'Failed to update company'
                toast.show(msg, 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async deleteCompany(companyId: string) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                await apiClient.delete(`/auth/companies/${companyId}`)
                const index = this.companies.findIndex(c => c.id === companyId)
                if (index !== -1) {
                    this.companies[index].is_active = false
                }
                toast.show('Company deactivated successfully', 'success')
            } catch (err: any) {
                const msg = err.error?.message || 'Failed to deactivate company'
                toast.show(msg, 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },
    },
})
