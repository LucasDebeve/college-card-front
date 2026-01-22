import { toast } from "sonner";

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
}

export function useToast() {
  const showToast = (type: ToastType, options: ToastOptions) => {
    const { title, description, duration = 5000 } = options;

    switch (type) {
      case 'success':
        toast.success(title, {
          description,
          duration,
        });
        break;
      case 'error':
        toast.error(title, {
          description,
          duration,
        });
        break;
      case 'warning':
        toast.warning(title, {
          description,
          duration,
        });
        break;
      case 'info':
        toast.info(title, {
          description,
          duration,
        });
        break;
    }
  };

  return {
    success: (options: ToastOptions) => showToast('success', options),
    error: (options: ToastOptions) => showToast('error', options),
    warning: (options: ToastOptions) => showToast('warning', options),
    info: (options: ToastOptions) => showToast('info', options),
    toast: showToast,
  };
}