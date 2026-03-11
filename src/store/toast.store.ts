import { defineStore } from 'pinia'

export interface ToastMessage {
    id: string
    text: string
    color: 'success' | 'error' | 'info' | 'warning'
    timeout?: number
}

export const useToastStore = defineStore('toast', {
    state: () => ({
        toasts: [] as ToastMessage[]
    }),
    actions: {
        show(text: string, color: ToastMessage['color'] = 'info', timeout = 4000) {
            const id = crypto.randomUUID()
            this.toasts.push({ id, text, color, timeout })

            // Auto remove after timeout
            if (timeout > 0) {
                setTimeout(() => {
                    this.remove(id)
                }, timeout)
            }
        },
        success(text: string, timeout?: number) {
            this.show(text, 'success', timeout)
        },
        error(text: string, timeout?: number) {
            this.show(text, 'error', timeout)
        },
        remove(id: string) {
            const index = this.toasts.findIndex(t => t.id === id)
            if (index > -1) {
                this.toasts.splice(index, 1)
            }
        }
    }
})
