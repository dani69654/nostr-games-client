// create a store for the auth state

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    nostrKey: string | null;
    publicKey: string | null;
    setNostrKey: (nostrKey: string) => void;
    setPublicKey: (publicKey: string) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            nostrKey: null,
            publicKey: null,
            setNostrKey: (nostrKey: string) => set({ nostrKey }),
            setPublicKey: (publicKey: string) => set({ publicKey }),
            clearAuth: () => set({ nostrKey: null, publicKey: null }),
        }),
        {
            name: 'nostr-auth-storage', // unique name for localStorage key
        }
    )
);
