import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastAction {
    label: string;
    onClick: () => void;
}

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    action?: ToastAction;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType, duration?: number, action?: ToastAction) => void;
    removeToast: (id: string) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

export const useToast = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (message, type = 'info', duration = 5000, action) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
            toasts: [...state.toasts, { id, message, type, duration, action }],
        }));

        if (duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id),
                }));
            }, duration);
        }
    },
    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
    success: (message, duration) => {
        const store = useToast.getState();
        store.addToast(message, 'success', duration);
    },
    error: (message, duration) => {
        const store = useToast.getState();
        store.addToast(message, 'error', duration);
    },
    warning: (message, duration) => {
        const store = useToast.getState();
        store.addToast(message, 'warning', duration);
    },
    info: (message, duration) => {
        const store = useToast.getState();
        store.addToast(message, 'info', duration);
    },
}));
