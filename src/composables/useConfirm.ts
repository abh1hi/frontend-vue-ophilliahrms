import { ref, reactive } from 'vue'

interface ConfirmOptions {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  confirmColor?: string
  icon?: string
}

const defaultOptions: ConfirmOptions = {
  title: 'Confirm Action',
  message: 'Are you sure you want to proceed?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmColor: 'error',
  icon: 'mdi-alert-circle-outline',
}

export function useConfirm() {
  const visible = ref(false)
  const loading = ref(false)
  const options = reactive<ConfirmOptions>({ ...defaultOptions })

  let resolveFn: ((value: boolean) => void) | null = null

  const confirm = (opts?: ConfirmOptions): Promise<boolean> => {
    Object.assign(options, defaultOptions, opts)
    visible.value = true

    return new Promise<boolean>((resolve) => {
      resolveFn = resolve
    })
  }

  const handleConfirm = () => {
    visible.value = false
    resolveFn?.(true)
    resolveFn = null
  }

  const handleCancel = () => {
    visible.value = false
    resolveFn?.(false)
    resolveFn = null
  }

  const dialogProps = {
    get modelValue() { return visible.value },
    set modelValue(v: boolean) {
      if (!v) handleCancel()
    },
    get title() { return options.title },
    get message() { return options.message },
    get confirmText() { return options.confirmText },
    get cancelText() { return options.cancelText },
    get confirmColor() { return options.confirmColor },
    get icon() { return options.icon },
    get loading() { return loading.value },
    onConfirm: handleConfirm,
    'onUpdate:modelValue': (v: boolean) => {
      if (!v) handleCancel()
    },
  }

  return {
    confirm,
    dialogProps,
    loading,
  }
}
