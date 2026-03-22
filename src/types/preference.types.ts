export interface NotificationPreference {
    user_id: string
    email_enabled: boolean
    sms_enabled: boolean
    created_at?: string
    updated_at?: string
}

export interface PreferenceUpdate {
    email_enabled?: boolean
    sms_enabled?: boolean
}
