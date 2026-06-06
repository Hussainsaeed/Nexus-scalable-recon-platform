'use client';

import React, { useState, useEffect } from 'react';


export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(
    'http://localhost:5000'
  );

  const [scanDepth, setScanDepth] = useState(
    'Aggressive'
  );

  const [saved, setSaved] = useState(false);

  const [name, setName] = useState('');
const [email, setEmail] = useState('');

const [currentPassword, setCurrentPassword] =
  useState('');

const [newPassword, setNewPassword] =
  useState('');

const [confirmPassword, setConfirmPassword] =
  useState('');

  useEffect(() => {
    const storedApi =
      localStorage.getItem('apiUrl');

    const storedDepth =
      localStorage.getItem('scanDepth');

    if (storedApi) {
      setApiUrl(storedApi);
    }

    if (storedDepth) {
      setScanDepth(storedDepth);
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem(
      'apiUrl',
      apiUrl
    );

    localStorage.setItem(
      'scanDepth',
      scanDepth
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  useEffect(() => {

    const fetchProfile =
      async () => {
  
        try {
  
          const token =
            localStorage.getItem(
              'token'
            );
  
          const res =
            await fetch(
              'http://localhost:5000/api/auth/me',
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );
  
          const data =
            await res.json();
  
          if (data.success) {
  
            setName(
              data.user.name || ''
            );
  
            setEmail(
              data.user.email || ''
            );
  
          }
  
        } catch (error) {
  
          console.error(error);
  
        }
  
      };
  
    fetchProfile();
  
  }, []);

  const handleSaveAccount =
  async () => {

    console.log('SAVE ACCOUNT CLICKED');

    try {

      if (
        newPassword &&
        newPassword !==
        confirmPassword
      ) {

        alert(
          'Passwords do not match'
        );

        return;
      }

      const token =
        localStorage.getItem(
          'token'
        );

      const res =
        await fetch(
          'http://localhost:5000/api/auth/account',
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              name,
              currentPassword,
              newPassword,
            }),
          }
        );

      const data =
        await res.json();

      if (data.success) {

        alert(
          'Account updated successfully'
        );

      } else {

        alert(
          data.message
        );

      }

    } catch (error) {

      console.error(error);

    }

  };

  return (
    <div className="p-8 text-zinc-100 min-h-screen bg-transparent">

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-emerald-400">
          Scanner Settings
        </h1>

        <p className="text-zinc-400 text-sm mt-1">
          تكوين وإعدادات محرك الفحص والاتصال بالـ API.
        </p>
      </div>

      <div className="max-w-2xl border border-zinc-800 rounded-lg p-6 bg-zinc-950/50 backdrop-blur-md space-y-6">

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Backend API URL
          </label>

          <input
            type="text"
            value={apiUrl}
            onChange={(e) =>
              setApiUrl(e.target.value)
            }
            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Scan Intensity Pass
          </label>

          <select
            value={scanDepth}
            onChange={(e) =>
              setScanDepth(e.target.value)
            }
            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="Passive">
              Passive (Safe Banner Checking)
            </option>

            <option value="Normal">
              Normal Heuristics
            </option>

            <option value="Aggressive">
              Aggressive Intrusion Injection
            </option>
          </select>
        </div>

        <button
          onClick={saveSettings}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm font-semibold transition-colors"
        >
          Save Configuration
        </button>

        {saved && (
          <div className="text-emerald-400 text-sm">
            ✅ Settings saved successfully
          </div>
        )}
        <hr className="border-zinc-800" />

<h2 className="text-2xl font-bold text-emerald-400">
  Account Settings
</h2>

<div>
  <label className="block mb-2">
    Name
  </label>

  <input
    type="text"
    value={name}
    onChange={(e) =>
      setName(e.target.value)
    }
    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5"
  />
</div>

<div>
  <label className="block mb-2">
    Email
  </label>

  <input
    type="email"
    value={email}
    onChange={(e) =>
      setEmail(e.target.value)
    }
    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5"
  />
</div>

<div>
  <label className="block mb-2">
    Current Password
  </label>

  <input
    type="password"
    value={currentPassword}
    onChange={(e) =>
      setCurrentPassword(
        e.target.value
      )
    }
    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5"
  />
</div>

<div>
  <label className="block mb-2">
    New Password
  </label>

  <input
    type="password"
    value={newPassword}
    onChange={(e) =>
      setNewPassword(
        e.target.value
      )
    }
    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5"
  />
</div>

<div>
  <label className="block mb-2">
    Confirm Password
  </label>

  <input
    type="password"
    value={confirmPassword}
    onChange={(e) =>
      setConfirmPassword(
        e.target.value
      )
    }
    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5"
  />
</div>

<button
  onClick={handleSaveAccount}
  className="
    px-4
    py-2
    bg-emerald-600
    hover:bg-emerald-500
    rounded
  "
>
  Save Account Changes
</button>
      </div>
    </div>
  );
}