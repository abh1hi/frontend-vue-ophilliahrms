import { defineStore } from 'pinia'
import apiClient from '@/utils/api-client'
import type {
    Student, SchoolClass, Guardian,
    StudentListResponse, ClassListResponse,
    StudentUpdate, StudentStatusChange,
    ClassCreate, ClassUpdate,
    GuardianCreate, GuardianUpdate
} from '@/types/api.types'
import { useToastStore } from './toast.store'

export const useStudentStore = defineStore('student', {
    state: () => ({
        students: [] as Student[],
        classes: [] as SchoolClass[],
        guardians: [] as Guardian[],
        totalStudents: 0,
        totalClasses: 0,
        isLoading: false,
    }),

    actions: {
        // ── Students ────────────────────────────────────────────────────────
        async fetchStudents(params: any = {}) {
            this.isLoading = true
            try {
                const response: any = await apiClient.get('/students/students', { params })
                const data: StudentListResponse = response.data || response
                this.students = data.items
                this.totalStudents = data.total
            } catch (err) {
                console.error('Failed to fetch students', err)
            } finally {
                this.isLoading = false
            }
        },

        async createStudent(studentData: any) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                const response: any = await apiClient.post('/students/students', studentData)
                const newStudent = response.data || response
                this.students.unshift(newStudent)
                this.totalStudents++
                toast.show('Student enrolled successfully', 'success')
                return newStudent
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to enroll student', 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async updateStudent(id: string, data: StudentUpdate) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                const response: any = await apiClient.put(`/students/students/${id}`, data)
                const updated: Student = response.data || response
                const idx = this.students.findIndex(s => s.id === id)
                if (idx !== -1) this.students[idx] = updated
                toast.show('Student updated successfully', 'success')
                return updated
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to update student', 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async changeStudentStatus(id: string, data: StudentStatusChange) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                const response: any = await apiClient.patch(`/students/students/${id}/status`, data)
                const updated: Student = response.data || response
                const idx = this.students.findIndex(s => s.id === id)
                if (idx !== -1) this.students[idx] = updated
                toast.show(`Student status changed to ${data.status}`, 'success')
                return updated
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to change status', 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async deleteStudent(id: string) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                await apiClient.delete(`/students/students/${id}`)
                this.students = this.students.filter(s => s.id !== id)
                this.totalStudents--
                toast.show('Student deleted successfully', 'success')
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to delete student', 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        // ── Classes ─────────────────────────────────────────────────────────
        async fetchClasses(params: any = {}) {
            try {
                const response: any = await apiClient.get('/students/classes', { params })
                const data: ClassListResponse = response.data || response
                this.classes = data.items
                this.totalClasses = data.total
            } catch (err) {
                console.error('Failed to fetch classes', err)
            }
        },

        async createClass(data: ClassCreate) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                const response: any = await apiClient.post('/students/classes', data)
                const newClass: SchoolClass = response.data || response
                this.classes.unshift(newClass)
                this.totalClasses++
                toast.show('Class created successfully', 'success')
                return newClass
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to create class', 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async updateClass(id: string, data: ClassUpdate) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                const response: any = await apiClient.put(`/students/classes/${id}`, data)
                const updated: SchoolClass = response.data || response
                const idx = this.classes.findIndex(c => c.id === id)
                if (idx !== -1) this.classes[idx] = updated
                toast.show('Class updated successfully', 'success')
                return updated
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to update class', 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async deleteClass(id: string) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                await apiClient.delete(`/students/classes/${id}`)
                this.classes = this.classes.filter(c => c.id !== id)
                this.totalClasses--
                toast.show('Class deleted successfully', 'success')
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to delete class', 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        // ── Guardians ───────────────────────────────────────────────────────
        async fetchGuardians(studentId: string) {
            try {
                const response: any = await apiClient.get(`/students/guardians/student/${studentId}`)
                const data = response.data || response
                this.guardians = Array.isArray(data) ? data : data.items || []
            } catch (err) {
                console.error('Failed to fetch guardians', err)
                this.guardians = []
            }
        },

        async createGuardian(data: GuardianCreate) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.post('/students/guardians', data)
                const newGuardian: Guardian = response.data || response
                this.guardians.push(newGuardian)
                toast.show('Guardian added successfully', 'success')
                return newGuardian
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to add guardian', 'error')
                throw err
            }
        },

        async updateGuardian(id: string, data: GuardianUpdate) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.put(`/students/guardians/${id}`, data)
                const updated: Guardian = response.data || response
                const idx = this.guardians.findIndex(g => g.id === id)
                if (idx !== -1) this.guardians[idx] = updated
                toast.show('Guardian updated successfully', 'success')
                return updated
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to update guardian', 'error')
                throw err
            }
        },

        async deleteGuardian(id: string) {
            const toast = useToastStore()
            try {
                await apiClient.delete(`/students/guardians/${id}`)
                this.guardians = this.guardians.filter(g => g.id !== id)
                toast.show('Guardian removed successfully', 'success')
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to remove guardian', 'error')
                throw err
            }
        },
    }
})
