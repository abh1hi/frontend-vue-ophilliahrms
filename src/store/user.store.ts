import { defineStore } from 'pinia'
import apiClient from '@/utils/api-client'
import { useToastStore } from './toast.store'
import type { User, AdminUserCreate, UserRole } from '@/types/user.types'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[],
    totalUsers: 0,
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchUsers() {
      this.isLoading = true
      this.error = null
      try {
        const response: any = await apiClient.get('/auth/users')
        const data = response.data || response
        if (Array.isArray(data)) {
          this.users = data
          this.totalUsers = data.length
        } else if (data.users) {
          this.users = data.users
          this.totalUsers = data.total || data.users.length
        }
      } catch (err: any) {
        this.error = err.error?.message || 'Failed to fetch users'
        console.error(this.error)
      } finally {
        this.isLoading = false
      }
    },

    async createUser(userData: AdminUserCreate) {
      const toast = useToastStore()
      this.isLoading = true
      try {
        const response: any = await apiClient.post('/auth/users', userData)
        const newUser: User = response.data || response
        this.users.unshift(newUser)
        this.totalUsers++
        toast.show('User created successfully', 'success')
        return newUser
      } catch (err: any) {
        const msg = err.error?.message || 'Failed to create user'
        toast.show(msg, 'error')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async updateUserRole(userId: string, role: UserRole) {
      const toast = useToastStore()
      this.isLoading = true
      try {
        const response: any = await apiClient.patch(`/auth/users/${userId}/role`, { role })
        const updatedUser: User = response.data || response
        const index = this.users.findIndex(u => u.id === userId)
        if (index !== -1) {
          this.users[index] = updatedUser
        }
        toast.show('User role updated', 'success')
        return updatedUser
      } catch (err: any) {
        const msg = err.error?.message || 'Failed to update role'
        toast.show(msg, 'error')
        throw err
      } finally {
        this.isLoading = false
      }
    },
  },
})
