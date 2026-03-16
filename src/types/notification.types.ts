import type { BaseModel } from './common.types'

export interface NotificationLog extends BaseModel {
    type: string
    subject?: string
    message: string
    status: string
    error_message?: string
    sent_at?: string
}
