'use client';

import { useEffect, useState } from 'react';
import { LucideCpu, LucideDatabase, LucideActivity, LucideRefreshCw } from 'lucide-react';

type ServerStatus = 'online' | 'offline';

type Server = {
  id: string;
  name: string;
  status: ServerStatus;
  ip: string;
  cpu: string;
  ram: string;
};

const API_BASE = 'http://localhost:5000';

export default function ServersOverview() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // دالة جلب البيانات من الباكيند مع دعم معالجة الأخطاء الذكية
  async function fetchServers() {
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch(`${API_BASE}/api/servers`, {
        cache: 'no-store' // منع المتصفح من الكاش لتحديث البيانات حياً
      });

      if (!res.ok) {
        throw new Error(`Failed to load servers (Status: ${res.status})`);
      }

      const data = await res.json();
      
      // التأكد من أن البيانات القادمة مصفوفة دائماً لعدم حدوث انهيار برمجي
      if (Array.isArray(data)) {
        setServers(data);
      } else if (data && typeof data === 'object') {
        // حماية إضافية في حال أرسل الباكيند كائن يحتوي على المصفوفة بالداخل
        const potentialArray = data.servers || data.data || [];
        setServers(Array.isArray(potentialArray) ? potentialArray : [data as Server]);
      } else {
        setServers([]);
      }
    } catch (e: any) {
      console.error('Error fetching servers:', e);
      setError(e?.message || 'Connection to backend failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 1. جلب البيانات عند أول تحميل للصفحة
    void fetchServers();

    // 2. تحديث تلقائي كل 5 ثوانٍ لمحاكاة البيانات الحية الحقيقية CPU/RAM
    const interval = setInterval(() => {
      void fetchServers();
    }, 5000);

    // 3. الاستماع لحدث إنشاء سيرفر جديد من المودال لتحديث الجدول فوراً دون انتظار
    const handleChanged = () => {
      void fetchServers();
    };
    window.addEventListener('nexus:serversChanged', handleChanged);

    return () => {
      clearInterval(interval);
      window.removeEventListener('nexus:serversChanged', handleChanged);
    };
  }, []);

  if (loading && servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-3">
        <LucideRefreshCw className="h-6 w-6 animate-spin text-[#3b82f6]" />
        <p className="text-sm">Connecting to secure cluster infrastructure...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-center">
        <p className="text-sm text-red-400 font-medium">Backend Connection Error</p>
        <p className="text-xs text-zinc-500 mt-1">{error}</p>
        <button
          onClick={() => void fetchServers()}
          className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (servers.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20">
        <p className="text-sm text-zinc-400">No active servers provisioned.</p>
        <p className="text-xs text-zinc-600 mt-1">Click "Create Instance" above to deploy your first host.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {servers.map((server) => (
        <div
          key={server.id}
          className="relative rounded-2xl border border-zinc-800/80 bg-zinc-900/10 p-5 hover:border-zinc-700/60 transition group overflow-hidden"
        >
          {/* رأس بطاقة السيرفر */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] tracking-widest font-bold text-zinc-500 block uppercase mb-1">
                Node {server.id}
              </span>
              <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-white transition">
                {server.name}
              </h4>
            </div>
            
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                server.status === 'online'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${server.status === 'online' ? 'bg-emerald-400' : 'bg-zinc-400'}`} />
              {server.status.toUpperCase()}
            </span>
          </div>

          {/* خطوط المعالجة والقراءات الحية */}
          <div className="mt-5 space-y-3.5">
            {/* مؤشر الـ CPU */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-500 flex items-center gap-1">
                  <LucideCpu className="h-3.5 w-3.5" /> CPU Utilization
                </span>
                <span className="text-zinc-300 font-mono font-medium">{server.cpu}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] transition-all duration-500"
                  style={{ width: server.cpu }}
                />
              </div>
            </div>

            {/* مؤشر الـ RAM */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-500 flex items-center gap-1">
                  <LucideDatabase className="h-3.5 w-3.5" /> RAM Utilization
                </span>
                <span className="text-zinc-300 font-mono font-medium">{server.ram}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] transition-all duration-500"
                  style={{ width: server.ram }}
                />
              </div>
            </div>
          </div>

          {/* تذييل البطاقة وعنوان الـ IP */}
          <div className="mt-5 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs">
            <span className="text-zinc-600 font-mono">{server.ip}</span>
            <span className="text-zinc-500 flex items-center gap-1 bg-zinc-950/40 px-2 py-0.5 rounded-md border border-zinc-900">
              <LucideActivity className="h-3 w-3 text-[#3b82f6]" /> Stable
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}