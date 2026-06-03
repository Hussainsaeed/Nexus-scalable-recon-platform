'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { motion } from 'framer-motion';

import {
  loginUser,
} from '../../../services/auth.service';

import AuthLogo from '../../../components/auth/AuthLogo';

import AuthCard from '../../../components/auth/AuthCard';

import AuthBackground from '../../../components/auth/AuthBackground';

import { FcGoogle } from "react-icons/fc";

import { FaGithub } from "react-icons/fa";

export default function LoginPage() {

  const router =
    useRouter();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

    const [rememberMe,
      setRememberMe] =
      useState(true);

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleLogin =
    async () => {

      try {

        setLoading(true);

        setError('');

        const data =
          await loginUser(
            email,
            password
          );

          if (data.token) {

            if (rememberMe) {
          
              localStorage.setItem(
                'token',
                data.token
              );
          
            } else {
          
              sessionStorage.setItem(
                'token',
                data.token
              );
          
            }
          
            router.push(
              '/dashboard'
            );

        } else {

          setError(
            data.message ||
            'Login failed'
          );
        }

      } catch {

        setError(
          'Server error'
        );

      } finally {

        setLoading(false);

      }
    };

  return (

    <div className="min-h-screen flex items-center justify-center px-4">

      <AuthBackground />

      <motion.div
        initial={{
          opacity: 0,
          y: 40,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
      >

        <AuthCard>

          <AuthLogo />

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
              p-4
              rounded-xl
              bg-zinc-900/60
              border
              border-zinc-700
              mb-4
              outline-none
              focus:border-emerald-500
            "
          />

          <div className="relative">

            <input
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              className="
                w-full
                p-4
                rounded-xl
                bg-zinc-900/60
                border
                border-zinc-700
                outline-none
                focus:border-emerald-500
              "
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              className="
                absolute
                right-4
                top-4
                text-zinc-400
              "
            >
              {showPassword
                ? 'Hide'
                : 'Show'}
            </button>

          </div>

          <div className="flex items-center justify-between mt-4 mb-4">

  <label className="flex items-center gap-2 text-sm text-zinc-400">

  <input
  type="checkbox"
  checked={rememberMe}
  onChange={(e) =>
    setRememberMe(
      e.target.checked
    )
  }
  className="
    accent-emerald-500
  "
/>

    Remember Me

  </label>

  <button
    type="button"
    className="
      text-sm
      text-emerald-400
      hover:text-emerald-300
      transition
    "
  >
    Forgot Password?
  </button>

</div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="
              mt-6
              w-full
              p-4
              rounded-xl
              bg-emerald-500
              hover:bg-emerald-600
              font-bold
              transition-all
            "
          >
            {loading
              ? 'Signing In...'
              : 'Sign In'}
          </button>

          <div className="my-6 flex items-center">

            <div className="flex-1 h-px bg-zinc-800" />

            <span className="px-3 text-zinc-500 text-sm">
              OR
            </span>

            <div className="flex-1 h-px bg-zinc-800" />

          </div>

           {/* Google */}
  <button
    className="
      w-full
      flex
      items-center
      justify-center
      gap-3
      border
      border-zinc-700
      hover:border-zinc-500
      bg-zinc-900/50
      rounded-xl
      py-3
      transition-all
      duration-300
      hover:bg-zinc-800/50
      hover:scale-[1.01]
    "
  >
    <FcGoogle size={20} />
    <span className="font-medium">
      Continue with Google
    </span>
  </button>

  {/* GitHub */}
  <button
    className="
      w-full
      flex
      items-center
      justify-center
      gap-3
      border
      border-zinc-700
      hover:border-zinc-500
      bg-zinc-900/50
      rounded-xl
      py-3
      transition-all
      duration-300
      hover:bg-zinc-800/50
      hover:scale-[1.01]
    "
  >
    <FaGithub size={20} />
    <span className="font-medium">
      Continue with GitHub
    </span>
  </button>

          <p className="mt-6 text-center text-zinc-400">

            Don't have an account?

            <a
              href="/auth/register"
              className="
                ml-2
                text-emerald-400
              "
            >
              Register
            </a>

          </p>

        </AuthCard>

      </motion.div>

    </div>
  );
}