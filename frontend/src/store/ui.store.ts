import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    commandPaletteOpen: boolean;
    chatWidgetOpen: boolean;

    // Actions
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    toggleCommandPalette: () => void;
    setCommandPaletteOpen: (open: boolean) => void;
    toggleChatWidget: () => void;
    setChatWidgetOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set, get) => ({
            theme: 'dark',
            sidebarOpen: true,
            commandPaletteOpen: false,
            chatWidgetOpen: false,

            toggleTheme: () =>
                set((state) => ({
                    theme: state.theme === 'light' ? 'dark' : 'light',
                })),

            setTheme: (theme: 'light' | 'dark') => set({ theme }),

            toggleSidebar: () =>
                set((state) => ({
                    sidebarOpen: !state.sidebarOpen,
                })),

            setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

            toggleCommandPalette: () =>
                set((state) => ({
                    commandPaletteOpen: !state.commandPaletteOpen,
                })),

            setCommandPaletteOpen: (open: boolean) => set({ commandPaletteOpen: open }),

            toggleChatWidget: () =>
                set((state) => ({
                    chatWidgetOpen: !state.chatWidgetOpen,
                })),

            setChatWidgetOpen: (open: boolean) => set({ chatWidgetOpen: open }),
        }),
        {
            name: 'ui-storage',
            partialize: (state) => ({
                theme: state.theme,
                sidebarOpen: state.sidebarOpen,
            }),
        }
    )
);
