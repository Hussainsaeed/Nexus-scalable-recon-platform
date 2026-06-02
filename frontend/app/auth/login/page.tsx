'use client';

import {
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import { loginUser } from '../../../services/auth.service';

export default function LoginPage() {

  const router =
    useRouter();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const handleLogin =
    async () => {

      const data =
        await loginUser(
          email,
          password
        );

      if (data.token) {

        localStorage.setItem(
          'token',
          data.token
        );

        router.push(
          '/dashboard'
        );
      }
    };

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        Login
      </h1>

      <input
        className="border p-3 mb-3 w-full"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(
            e.target.value
          )
        }
      />

      <input
        type="password"
        className="border p-3 mb-3 w-full"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(
            e.target.value
          )
        }
      />

      <button
        onClick={handleLogin}
      >
        Login
      </button>

    </div>
  );
}