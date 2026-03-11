import { defineStore } from 'pinia'
import apiClient from '@/utils/api-client'
import type { Student, SchoolClass, Guardian, StudentListResponse, ClassListResponse } from '@/types/api.types'
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
                toast.show('Student enrolled successfully', 'success')
                return newStudent
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to enroll student', 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async fetchGuardians(studentId: string) {
            try {
                const response: any = await apiClient.get(`/students/guardians?student_id=${studentId}`)
                this.guardians = response.data || response
            } catch (err) {
                console.error('Failed to fetch guardians', err)
            }
        }
    }
})
