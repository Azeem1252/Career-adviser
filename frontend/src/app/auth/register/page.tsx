'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to unified auth page in register mode
        router.replace('/auth?mode=register');
    }, [router]);

    return null;
}
