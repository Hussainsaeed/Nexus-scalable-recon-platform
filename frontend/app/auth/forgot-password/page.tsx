'use client';

import { useState } from 'react';

import AuthBackground from '../../../components/auth/AuthBackground';
import AuthCard from '../../../components/auth/AuthCard';
import AuthLogo from '../../../components/auth/AuthLogo';

export default function ForgotPasswordPage() {

  const [email, setEmail] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

    const [error, setError] =
  useState('');

  const handleSubmit =
  async () => {

    try {

      setLoading(true);
      setError('');

      const response =
        await fetch(
          'http://localhost:5000/api/auth/forgot-password',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              email,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        setError(
          data.error ||
          'Request failed'
        );

        return;
      }

      if (!response.ok) {

        setError(
          data.error ||
          'Request failed'
        );
      
        return;
      }
      
      setSuccess(true);

      setSuccess(true);

    } catch (err) {

      setError(
        'Server error'
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
            Enter your email to receive a password reset link
          </p>

          {error && (
  <div
    className="
      mb-4
      p-3
      rounded-xl
      border
      border-red-500/30
      bg-red-500/10
      text-red-400
      text-sm
    "
  >
    {error}
  </div>
)}

          {!success ? (
            <>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                className="
                  w-full
                  px-4
                  py-3
                  rounded-xl
                  bg-zinc-900/60
                  border
                  border-zinc-700
                  mb-5
                "
              />

              <button
                onClick={handleSubmit}
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
                {loading
                  ? 'Sending...'
                  : 'Send Reset Link'}
              </button>
            </>
          ) : (
            <div
              className="
                text-center
                border
                border-emerald-500/30
                bg-emerald-500/10
                rounded-xl
                p-4
              "
            >
              <p className="text-emerald-400 font-medium">
                Reset link sent successfully
              </p>

              <p className="text-zinc-400 text-sm mt-2">
                Check your inbox and follow the instructions.
              </p>
            </div>
          )}

        </AuthCard>

      </div>
    </>
  );
}