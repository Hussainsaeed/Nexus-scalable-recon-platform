'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import AuthBackground from '@/components/auth/AuthBackground';
import AuthCard from '@/components/auth/AuthCard';
import AuthLogo from '@/components/auth/AuthLogo';

export default function ResetPasswordPage() {

  const params = useParams();

const token =
  params.token as string;

console.log(
  'RESET TOKEN:',
  token
);

  const [password, setPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

    const handleResetPassword =
    async () => {
  
      try {
  
        if (
          password !==
          confirmPassword
        ) {
  
          alert(
            'Passwords do not match'
          );
  
          return;
        }
  
        setLoading(true);
  
        const response =
          await fetch(
            `http://localhost:5000/api/auth/reset-password/${token}`,
            {
              method: 'POST',
  
              headers: {
                'Content-Type':
                  'application/json',
              },
  
              body: JSON.stringify({
                password,
              }),
            }
          );
  
        const data =
          await response.json();
  
        if (!response.ok) {
          throw new Error(
            data.error
          );
        }
  
        alert(
          'Password updated successfully'
        );

        window.location.href ='/auth/login';
  
      } catch (error: any) {
  
        alert(
          error.message
        );
  
      } finally {
  
        setLoading(false);
  
      }
  
    };

  return (
    <>
      <AuthBackground />

      <div className="min-h-screen flex items-center justify-center">

        <AuthCard>

          <AuthLogo />

          <h1 className="text-4xl font-bold text-center mb-2">
            Reset Password
          </h1>

          <p className="text-zinc-400 text-center mb-8">
            Enter your new password
          </p>

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="
              w-full
              mb-4
              px-4
              py-3
              rounded-xl
              bg-zinc-900/60
              border
              border-zinc-700
            "
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            className="
              w-full
              mb-6
              px-4
              py-3
              rounded-xl
              bg-zinc-900/60
              border
              border-zinc-700
            "
          />

          <button
            onClick={
              handleResetPassword
            }
            disabled={loading}
            className="
              w-full
              py-3
              rounded-xl
              bg-emerald-500
              hover:bg-emerald-600
              font-semibold
              transition
            "
          >
            {
              loading
                ? 'Updating Password...'
                : 'Reset Password'
            }
          </button>

        </AuthCard>

      </div>
    </>
  );
}