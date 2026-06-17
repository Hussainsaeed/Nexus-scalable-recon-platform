'use client';

import { useMemo, useState } from 'react';
import { LucidePlus, LucideServer, LucideSparkles } from 'lucide-react';

export type ServerType =
  | 'Ubuntu 22.04'
  | 'Ubuntu 24.04'
  | 'Debian 12'
  | 'AlmaLinux 9'
  | 'Rocky Linux 9';

export type Region = 'us-east' | 'us-west' | 'eu-central' | 'ap-south' | 'sa-east';

export type PlanSize = 'starter' | 'pro' | 'enterprise';

export interface CreateInstancePayload {
  name: string;
  region: Region;
  type: ServerType;
  plan: PlanSize;
  ip?: string;
}
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://nexus-backend-5z3j.onrender.com';


const regions: Region[] = ['us-east', 'us-west', 'eu-central', 'ap-south', 'sa-east'];
const types: ServerType[] = ['Ubuntu 22.04', 'Ubuntu 24.04', 'Debian 12', 'AlmaLinux 9', 'Rocky Linux 9'];
const plans: { id: PlanSize; label: string; desc: string; hints: string }[] = [
  { id: 'starter', label: 'Starter', desc: 'For prototypes and small workloads', hints: '1 vCPU · 2GB RAM' },
  { id: 'pro', label: 'Pro', desc: 'Balanced compute for production workloads', hints: '2 vCPU · 4GB RAM' },
  { id: 'enterprise', label: 'Enterprise', desc: 'High throughput with redundancy', hints: '4 vCPU · 8GB RAM' }
];

function generateRandomIp() {
  return `192.168.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;
}

export default function CreateInstanceModal() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState<CreateInstancePayload>({
    name: '',
    region: 'us-east',
    type: 'Ubuntu 22.04',
    plan: 'starter'
  });

  const planMeta = useMemo(() => plans.find((p) => p.id === form.plan)!, [form.plan]);

  // دالة مخصصة لإغلاق المودال وتنظيف كافة المدخلات ليعود الزر قابلاً للضغط فوراً
  function handleClose() {
    setOpen(false);
    setError('');
    setSuccess('');
    setForm({ name: '', region: 'us-east', type: 'Ubuntu 22.04', plan: 'starter' });
  }

  async function onSubmit() {
    if (!form.name.trim()) return;
    
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...form,
        ip: generateRandomIp()
      };

      const res = await fetch(`${API_BASE}/api/servers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Create failed (${res.status}) ${text}`.trim());
      }

      const data = await res.json();
      const createdName = data?.name || form.name;

      setSuccess(`Instance "${createdName}" created successfully!`);
      
      // تحديث فوري للأحداث لجدول السيرفرات
      window.dispatchEvent(new Event('nexus:serversChanged'));

      // إصلاح التعليق: نغلق النافذة ونعيد تصفير الحالة أولاً قبل التحديث العام
      setTimeout(() => {
        handleClose();
        window.location.reload();
      }, 800);

    } catch (e: any) {
      setError(e?.message || 'Unable to create instance');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl border border-zinc-800/70 bg-gradient-to-br from-[#3b82f6]/15 to-[#8b5cf6]/15 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-900/40 transition cursor-pointer"
      >
        <LucidePlus className="h-4 w-4" strokeWidth={2} />
        Create Instance
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* الخلفية المظلمة */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* محتوى النافذة المنبثقة */}
          <div className="relative w-full max-w-2xl rounded-3xl border border-zinc-800/80 bg-[#0b0b10] shadow-[0_0_60px_rgba(139,92,246,0.25)] overflow-hidden z-10">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/70">
              <div>
                <div className="flex items-center gap-2">
                  <LucideServer className="h-5 w-5 text-[#3b82f6]" strokeWidth={2} />
                  <h3 className="text-lg font-semibold text-zinc-100">Create Instance</h3>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  Provision a new server using live backend APIs. Realtime CPU/RAM will calculate upon creation.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-zinc-800/70 bg-black/20 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/40 transition cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Server Name"
                  value={form.name}
                  placeholder="e.g., app-worker-06"
                  onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                  required
                />

                <SelectField
                  label="Region"
                  value={form.region}
                  options={regions}
                  onChange={(v) => setForm((p) => ({ ...p, region: v as Region }))}
                />

                <SelectField
                  label="OS Image"
                  value={form.type}
                  options={types}
                  onChange={(v) => setForm((p) => ({ ...p, type: v as ServerType }))}
                />

                <div>
                  <div className="text-xs tracking-widest text-zinc-500">PLAN / SIZE</div>
                  <div className="mt-2 space-y-2">
                    {plans.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, plan: p.id }))}
                        className={
                          'w-full rounded-2xl border px-4 py-3 text-left transition cursor-pointer ' +
                          (form.plan === p.id
                            ? 'border-[#3b82f6]/60 bg-[#3b82f6]/10'
                            : 'border-zinc-800/70 bg-zinc-900/20 hover:bg-zinc-900/30')
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-zinc-100">{p.label}</div>
                            <div className="mt-1 text-xs text-zinc-500">{p.desc}</div>
                          </div>
                          {form.plan === p.id ? (
                            <LucideSparkles className="h-4 w-4 text-[#8b5cf6]" strokeWidth={2} />
                          ) : null}
                        </div>
                        <div className="mt-2 text-xs text-zinc-400">{p.hints}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/20 px-4 py-3">
                <div className="text-xs text-zinc-500">Summary</div>
                <div className="mt-1 text-sm text-zinc-200">
                  <span className="font-semibold">{form.name || '—'}</span> · {form.region.toUpperCase()} · {form.type} ·{' '}
                  {planMeta.label}
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {success}
                </div>
              ) : null}
            </div>

            <div className="px-6 py-5 border-t border-zinc-800/70 flex items-center justify-end gap-3 bg-[#08080c]">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="rounded-2xl border border-zinc-800/70 bg-black/20 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900/40 transition disabled:opacity-60 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void onSubmit()}
                disabled={submitting || !form.name.trim()}
                className="rounded-2xl border border-[#3b82f6]/60 bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/20 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-900/35 transition disabled:opacity-60 cursor-pointer"
              >
                {submitting ? 'Creating…' : 'Create Instance'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required
}: {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-xs tracking-widest text-zinc-500">{label.toUpperCase()}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-zinc-800/70 bg-zinc-900/20 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/35"
      />
      {required ? <div className="mt-1 text-xs text-zinc-500">Required</div> : null}
    </div>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-xs tracking-widest text-zinc-500">{label.toUpperCase()}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-zinc-800/70 bg-zinc-900/20 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#0b0b10]">
            {o.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}