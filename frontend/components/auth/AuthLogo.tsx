import Image from 'next/image';

export default function AuthLogo() {
  return (
    <div className="text-center mb-8">

      <div
        className="
          w-32
          h-32
          mx-auto
          rounded-3xl
          bg-emerald-500/10
          border
          border-emerald-500/30
          flex
          items-center
          justify-center
          mb-4
          shadow-[0_0_40px_rgba(16,185,129,0.6)]
          overflow-hidden
        "
      >
        <Image
          src="/nexus-logo.png"
          alt="Nexus Logo"
          width={140}
          height={140}
        />
      </div>

      <h1 className="text-4xl font-bold text-white">
        Nexus Recon
      </h1>

      <p className="text-zinc-400 mt-2">
        Scalable Recon Platform
      </p>

    </div>
  );
}