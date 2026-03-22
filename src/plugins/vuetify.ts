import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

const adminLightTheme = {
    dark: false,
    colors: {
        background: '#F5F7FA',
        surface: '#FFFFFF',
        'surface-variant': '#F0F2F5',
        'surface-bright': '#FFFFFF',
        primary: '#1E3A5F',
        'primary-darken-1': '#152C4A',
        'primary-lighten-1': '#2E5B8A',
        secondary: '#0D9488',
        'secondary-darken-1': '#0A7A70',
        'secondary-lighten-1': '#14B8A6',
        accent: '#7C3AED',
        error: '#DC2626',
        warning: '#F59E0B',
        info: '#3B82F6',
        success: '#10B981',
        'on-background': '#1E293B',
        'on-surface': '#334155',
        'on-primary': '#FFFFFF',
        'on-secondary': '#FFFFFF',
    },
}

const adminDarkTheme = {
    dark: true,
    colors: {
        background: '#0F172A',
        surface: '#1E293B',
        'surface-variant': '#334155',
        'surface-bright': '#475569',
        primary: '#3B82F6',
        'primary-darken-1': '#2563EB',
        'primary-lighten-1': '#60A5FA',
        secondary: '#14B8A6',
        'secondary-darken-1': '#0D9488',
        'secondary-lighten-1': '#2DD4BF',
        accent: '#A78BFA',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
        success: '#10B981',
        'on-background': '#E2E8F0',
        'on-surface': '#CBD5E1',
        'on-primary': '#FFFFFF',
        'on-secondary': '#FFFFFF',
    },
}

const savedTheme = (typeof localStorage !== 'undefined' && localStorage.getItem('ophillia-theme')) || 'adminLightTheme'

export default createVuetify({
    theme: {
        defaultTheme: savedTheme,
        themes: {
            adminLightTheme,
            adminDarkTheme,
        },
    },
    defaults: {
        VCard: {
            rounded: 'lg',
            elevation: 0,
            border: true,
        },
        VBtn: {
            rounded: 'lg',
        },
        VTextField: {
            variant: 'outlined',
            density: 'comfortable',
        },
        VSelect: {
            variant: 'outlined',
            density: 'comfortable',
        },
        VDataTable: {
            hover: true,
        },
    },
})
