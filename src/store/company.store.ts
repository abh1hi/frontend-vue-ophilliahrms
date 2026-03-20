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
    },
})
