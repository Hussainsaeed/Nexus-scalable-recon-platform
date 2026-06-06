'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const token = params.get('token');

    if (token) {
      localStorage.setItem(
        'token',
        token
      );

      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Signing you in...
    </div>
  );
}