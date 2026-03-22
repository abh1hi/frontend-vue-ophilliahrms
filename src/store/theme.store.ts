import { defineStore } from 'pinia'
import { useTheme } from 'vuetify'

export const useThemeStore = defineStore('theme', {
    state: () => ({
        current: localStorage.getItem('ophillia-theme') || 'adminLightTheme',
    }),

    getters: {
        isDark: (state) => state.current === 'adminDarkTheme',
    },

    actions: {
        toggle() {
            this.current = this.current === 'adminLightTheme' ? 'adminDarkTheme' : 'adminLightTheme'
            localStorage.setItem('ophillia-theme', this.current)
        },

        applyTheme() {
            const theme = useTheme()
            theme.global.name.value = this.current
        },
    },
})
