'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { LoadingPage } from '@/components/shared';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading, checkAuth, _hasHydrated } = useAuthStore();
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Wait for Zustand to hydrate from localStorage
        if (_hasHydrated) {
            checkAuth().then(() => setIsReady(true));
        }
    }, [_hasHydrated, checkAuth]);

    useEffect(() => {
        // Only redirect after hydration and auth check are complete
        if (isReady && !loading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, loading, router, isReady]);

    // Show loading while hydrating or checking auth
    if (!isReady || loading) {
        return <LoadingPage message="Verifying session..." />;
    }

    // Don't render anything if not authenticated (will redirect)
    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
};
