'use client';

import { useEffect, useState } from 'react';


const API_URL =
  process.env.NEXT_PUBLIC_API_URL;
export default function ProfilePage() {

  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] =
  useState('');

const [savingAvatar, setSavingAvatar] =
  useState(false);

  const [avatarFile, setAvatarFile] =
  useState<File | null>(null);

const [uploading, setUploading] =
  useState(false);

  const handleAvatarUpdate =
  async () => {

    try {

      setSavingAvatar(true);

      const token =
        localStorage.getItem(
          'token'
        );

      await fetch(
  `${API_URL}/api/auth/avatar`,
        {
          method: 'PUT',

          headers: {
            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            avatar: avatarUrl,
          }),
        }
      );

      window.location.reload();

    } catch (error) {

      console.error(error);

    } finally {

      setSavingAvatar(false);

    }
};

const handleAvatarUpload = async () => {

    if (!avatarFile) {
      return;
    }
  
    try {
  
      setUploading(true);
  
      const token =
        localStorage.getItem(
          'token'
        );
  
      const formData =
        new FormData();
  
      formData.append(
        'avatar',
        avatarFile
      );
  
      await fetch(
  `${API_URL}/api/auth/upload-avatar`,
        {
          method: 'POST',
  
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
  
          body: formData,
        }
      );
  
      window.location.reload();
  
    } catch (error) {
  
      console.error(error);
  
    } finally {
  
      setUploading(false);
  
    }
  
  };

  useEffect(() => {

    const fetchProfile = async () => {

      try {

        const token =
          localStorage.getItem('token');

        const res = await fetch(
  `${API_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data =
          await res.json();

        if (data.success) {
          setUser(data.user);
        }

      } catch (error) {

        console.error(error);

      }

    };

    fetchProfile();

  }, []);

  if (!user) {
    return (
      <div className="p-10">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">

      <div
        className="
          rounded-3xl
          border
          border-emerald-500/20
          bg-zinc-900/40
          p-8
        "
      >

        <div className="flex items-center gap-6">

        <div
  className="
    w-28
    h-28
    rounded-full
    overflow-hidden
    border
    border-emerald-500/30
    flex
    items-center
    justify-center
    bg-emerald-500/20
  "
>
  {user.avatar ? (

    <img
      src={user.avatar}
      alt="Avatar"
      className="
        w-full
        h-full
        object-cover
      "
    />

  ) : (

    <span
      className="
        text-4xl
        font-bold
        text-emerald-400
      "
    >
      {user.name?.charAt(0)}
    </span>

  )}
</div>

          <div>

            <h1 className="text-3xl font-bold">
              {user.name}
            </h1>

            <p className="text-zinc-400">
              {user.email}
            </p>

            <span
              className="
                inline-block
                mt-3
                px-3
                py-1
                rounded-lg
                bg-emerald-500/20
                text-emerald-400
                text-sm
              "
            >
              {user.role}
            </span>

          </div>

        </div>

        <div className="mt-6 mb-8">

  <p className="text-zinc-400 mb-2">
    Avatar URL
  </p>

  <div className="flex gap-3">

    <input
      type="text"
      placeholder="https://..."
      value={avatarUrl}
      onChange={(e) =>
        setAvatarUrl(
          e.target.value
        )
      }
      className="
        flex-1
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
        handleAvatarUpdate
      }
      disabled={savingAvatar}
      className="
        px-5
        rounded-xl
        bg-emerald-500
        hover:bg-emerald-600
      "
    >
      {
        savingAvatar
          ? 'Saving...'
          : 'Save Avatar'
      }
    </button>

  </div>

</div>

<div className="mt-4">

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {

      if (
        e.target.files &&
        e.target.files[0]
      ) {
        setAvatarFile(
          e.target.files[0]
        );
      }

    }}
  />

  <button
    onClick={handleAvatarUpload}
    disabled={uploading}
    className="
      ml-3
      px-4
      py-2
      rounded-xl
      bg-emerald-500
      hover:bg-emerald-600
    "
  >
    {
      uploading
        ? 'Uploading...'
        : 'Upload Avatar'
    }
  </button>

</div>

        <div className="mt-10 grid md:grid-cols-2 gap-6">

          <div className="rounded-2xl border border-zinc-800 p-5">
            <p className="text-zinc-500 text-sm">
              Full Name
            </p>

            <p className="mt-2 text-lg">
              {user.name}
            </p>
          </div>

          
          <div className="rounded-2xl border border-zinc-800 p-5">
            <p className="text-zinc-500 text-sm">
              Email
            </p>

            <p className="mt-2 text-lg">
              {user.email}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 p-5">
            <p className="text-zinc-500 text-sm">
              Role
            </p>

            <p className="mt-2 text-lg">
              {user.role}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 p-5">
            <p className="text-zinc-500 text-sm">
              Member Since
            </p>

            <p className="mt-2 text-lg">
              {new Date(
                user.createdAt
              ).toLocaleDateString()}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}