'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  registerUser,
} from '../../../services/auth.service';

import AuthBackground from '../../../components/auth/AuthBackground';
import AuthCard from '../../../components/auth/AuthCard';
import AuthLogo from '../../../components/auth/AuthLogo';

import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function RegisterPage() {

  const router =
    useRouter();

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

    const [confirmPassword, setConfirmPassword] =
  useState('');

  const [strength, setStrength] =
  useState('');

  const [showPassword, setShowPassword] =
  useState(false);

  const [showConfirmPassword,
    setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

const checkPasswordStrength =
  (password: string) => {

    if (password.length < 6) {

      setStrength('Weak');

    } else if (
      password.length < 10
    ) {

      setStrength('Medium');

    } else {

      setStrength('Strong');
    }
  };

  const handleRegister =
    async () => {

      if (
        password !==
        confirmPassword
      ) {
      
        alert(
          'Passwords do not match'
        );
      
        return;
      }

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
      <>
        <AuthBackground />
    
        <div className="min-h-screen flex items-center justify-center">
    
          <AuthCard>
    
            <AuthLogo />
    
            <h1 className="text-5xl font-bold text-center mb-2">
              Create Account
            </h1>

            <div className="my-6 flex items-center gap-3">

  <div className="h-px flex-1 bg-zinc-800" />

  <span className="text-zinc-500 text-sm">
    OR
  </span>

  <div className="h-px flex-1 bg-zinc-800" />

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
    mb-3
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
    
            <p className="text-zinc-400 text-center mb-8">
              Join Nexus Recon Platform
            </p>
    
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
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
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
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
    
    <div className="relative">

<input
  type={
    showPassword
      ? 'text'
      : 'password'
  }
  placeholder="Password"
  value={password}
  onChange={(e) => {

    setPassword(
      e.target.value
    );

    checkPasswordStrength(
      e.target.value
    );

  }}
  className="
    w-full
    mb-5
    px-4
    py-3
    pr-12
    rounded-xl
    bg-zinc-900/60
    border
    border-zinc-700
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
    top-3
    text-zinc-400
    hover:text-emerald-400
    transition
  "
>
  {showPassword
    ? <FaEyeSlash />
    : <FaEye />}
</button>

</div>

<div className="mb-4">

  <div className="flex gap-2 mb-2">

    <div
      className={`
        h-2
        flex-1
        rounded-full
        ${
          strength === 'Weak' ||
          strength === 'Medium' ||
          strength === 'Strong'
            ? 'bg-red-500'
            : 'bg-zinc-800'
        }
      `}
    />

    <div
      className={`
        h-2
        flex-1
        rounded-full
        ${
          strength === 'Medium' ||
          strength === 'Strong'
            ? 'bg-yellow-500'
            : 'bg-zinc-800'
        }
      `}
    />

    <div
      className={`
        h-2
        flex-1
        rounded-full
        ${
          strength === 'Strong'
            ? 'bg-emerald-500'
            : 'bg-zinc-800'
        }
      `}
    />

  </div>

  <p
    className={`
      text-sm
      ${
        strength === 'Weak'
          ? 'text-red-400'
          : strength === 'Medium'
          ? 'text-yellow-400'
          : 'text-emerald-400'
      }
    `}
  >
    {strength}
  </p>
  </div>

  <div className="relative">

<input
  type={
    showConfirmPassword
      ? 'text'
      : 'password'
  }
  placeholder="Confirm Password"
  value={confirmPassword}
  onChange={(e) =>
    setConfirmPassword(
      e.target.value
    )
  }
  className="
    w-full
    mb-5
    px-4
    py-3
    pr-12
    rounded-xl
    bg-zinc-900/60
    border
    border-zinc-700
  "
/>

<button
  type="button"
  onClick={() =>
    setShowConfirmPassword(
      !showConfirmPassword
    )
  }
  className="
    absolute
    right-4
    top-3
    text-zinc-400
    hover:text-emerald-400
    transition
  "
>
  {showConfirmPassword
    ? <FaEyeSlash />
    : <FaEye />}
</button>

</div>
    
            <button
              onClick={handleRegister}
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
                ? 'Creating Account...'
                : 'Create Account'}
            </button>
    
            <p className="mt-6 text-center text-zinc-400">
    
              Already have an account?
    
              <a
                href="/auth/login"
                className="ml-2 text-emerald-400"
              >
                Login
              </a>
    
            </p>
    
          </AuthCard>
    
        </div>
      </>
    );
  }