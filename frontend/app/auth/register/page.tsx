'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  registerUser,
} from '../../../services/auth.service';

export default function RegisterPage() {

  const router =
    useRouter();

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const handleRegister =
    async () => {

      try {

        setLoading(true);

        const data =
          await registerUser(
            name,
            email,
            password
          );

        if (data.success) {

          alert(
            'Registration successful'
          );

          router.push(
            '/auth/login'
          );

        } else {

          alert(
            data.message ||
            'Registration failed'
          );
        }

      } catch (error) {

        console.error(error);

        alert(
          'Server error'
        );

      } finally {

        setLoading(false);

      }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">

      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold text-emerald-400 mb-6">

          Register

        </h1>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) =>
            setName(
              e.target.value
            )
          }
          className="w-full p-3 mb-4 rounded bg-zinc-800 border border-zinc-700"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          className="w-full p-3 mb-4 rounded bg-zinc-800 border border-zinc-700"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className="w-full p-3 mb-6 rounded bg-zinc-800 border border-zinc-700"
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 p-3 rounded font-bold"
        >
          {loading
            ? 'Creating Account...'
            : 'Register'}
        </button>

        <p className="mt-4 text-center">
  Already have an account?

  <a
    href="/auth/login"
    className="text-emerald-400 ml-2"
  >
    Login
  </a>

</p>

      </div>

    </div>
  );
}