import { motion } from 'framer-motion';

export default function AuthBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10">

      {/* Aurora Layer */}

<motion.div
  animate={{
    x: [0, 100, 0],
    y: [0, 50, 0],
  }}
  transition={{
    duration: 18,
    repeat: Infinity,
    ease: 'linear',
  }}
  className="
    absolute
    top-[-250px]
    left-[-250px]
    w-[900px]
    h-[900px]
    rounded-full
    bg-emerald-500/15
    blur-[220px]
  "
/>

<motion.div
  animate={{
    x: [0, -120, 0],
    y: [0, -80, 0],
  }}
  transition={{
    duration: 22,
    repeat: Infinity,
    ease: 'linear',
  }}
  className="
    absolute
    bottom-[-300px]
    right-[-300px]
    w-[1000px]
    h-[1000px]
    rounded-full
    bg-cyan-500/15
    blur-[260px]
  "
/>

<motion.div
  animate={{
    opacity: [0.3, 0.7, 0.3],
  }}
  transition={{
    duration: 8,
    repeat: Infinity,
  }}
  className="
    absolute
    left-1/2
    top-1/2
    -translate-x-1/2
    -translate-y-1/2
    w-[700px]
    h-[700px]
    rounded-full
    bg-emerald-400/5
    blur-[180px]
  "
/>

      {/* Emerald Orb */}
      <motion.div
        animate={{
          x: [0, 120, 0],
          y: [0, 60, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="
          absolute
          top-20
          left-20
          w-[600px]
          h-[600px]
          rounded-full
          bg-emerald-500/10
          blur-3xl
        "
      />

      {/* Cyan Orb */}
      <motion.div
        animate={{
          x: [0, -120, 0],
          y: [0, -60, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="
          absolute
          bottom-20
          right-20
          w-[700px]
          h-[700px]
          rounded-full
          bg-cyan-500/10
          blur-3xl
        "
      />

      {/* Radar Sweep */}

<motion.div
  animate={{
    rotate: [0, 360],
  }}
  transition={{
    duration: 6,
    repeat: Infinity,
    ease: 'linear',
  }}
  className="
    absolute
    left-1/2
    top-1/2
    -translate-x-1/2
    -translate-y-1/2
    w-[650px]
    h-[650px]
    rounded-full
    pointer-events-none
  "
>
  <div
    className="
      absolute
      inset-0
      rounded-full
      bg-[conic-gradient(from_0deg,rgba(215, 12, 12, 0.25),transparent_45deg)]
    "
  />
</motion.div>

      {/* Radar Ring */}
      <motion.div
        animate={{
            rotate: [0, 360],
            scale: [1, 1.05, 1],
          }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="
          absolute
          left-1/2
          top-1/2
          -translate-x-1/2
          -translate-y-1/2
          w-[400px]
          h-[400px]
          rounded-full
          border-4
          border-dashed
          border-emerald-400/20
        "
        >
        <div className="absolute top-0 left-1/2 w-4 h-4 bg-red-500 rounded-full" />
      </motion.div>

      {/* Second Radar Ring */}
      <motion.div
        animate={{
            rotate: [0, 360],
            scale: [1, 1.05, 1],
          }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="
          absolute
          left-1/2
          top-1/2
          -translate-x-1/2
          -translate-y-1/2
          w-[650px]
          h-[650px]
          rounded-full
          border-4
          border-dashed
          border-cyan-400/15
        "
        >
        <div className="absolute top-0 left-1/2 w-4 h-4 bg-cyan-400 rounded-full" />
      </motion.div>

      {/* Network Nodes */}
      <motion.div
  animate={{
    opacity: [0.3, 1, 0.3],
    scale: [1, 1.6, 1],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
  className="
    absolute
    left-[15%]
    top-[20%]
    w-2
    h-2
    rounded-full
    bg-emerald-400
    shadow-[0_0_15px_rgba(16,185,129,0.8)]
  "
/>
<motion.div
  animate={{
    opacity: [0.3, 1, 0.3],
    scale: [1, 1.6, 1],
  }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
  className="
    absolute
    left-[20%]
    top-[25%]
    w-2
    h-2
    rounded-full
    bg-cyan-400
    shadow-[0_0_15px_rgba(34,211,238,0.8)]
  "
/>
      <motion.div
  animate={{
    opacity: [0.3, 1, 0.3],
    scale: [1, 1.6, 1],
  }}
  transition={{
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
  className="
    absolute
    left-[25%]
    top-[45%]
    w-2
    h-2
    rounded-full
    bg-emerald-400
    shadow-[0_0_15px_rgba(16,185,129,0.8)]
  "
/>
<motion.div
  animate={{
    opacity: [0.3, 1, 0.3],
    scale: [1, 1.6, 1],
  }}
  transition={{
    duration: 5,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
  className="
    absolute
    left-[30%]
    top-[40%]
    w-2
    h-2
    rounded-full
    bg-cyan-400
    shadow-[0_0_15px_rgba(34,211,238,0.8)]
  "
/>

      {/* Grid */}
      <div
        className="
          absolute
          inset-0
          opacity-20
        "
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(0,255,150,0.08) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(0,255,150,0.08) 1px,
              transparent 1px
            )
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Hexagonal Cyber Grid */}

<div
  className="
    absolute
    inset-0
    opacity-[0.06]
  "
  style={{
    backgroundImage: `
      radial-gradient(
        circle at center,
        rgba(185, 182, 16, 0.15) 1px,
        transparent 1px
      )
    `,
    backgroundSize: '60px 52px',
    backgroundPosition: '0 0, 30px 26px',
  }}
/>

<svg
  className="
    absolute
    inset-0
    w-full
    h-full
    opacity-[0.05]
  "
>
  <defs>
    <pattern
      id="hexPattern"
      width="60"
      height="52"
      patternUnits="userSpaceOnUse"
    >
      <polygon
        points="
          30,0
          60,13
          60,39
          30,52
          0,39
          0,13
        "
        fill="none"
        stroke="rgb(16, 58, 185)"
        strokeWidth="0.5"
      />
    </pattern>
  </defs>

  <rect
    width="100%"
    height="100%"
    fill="url(#hexPattern)"
  />
</svg>

      {/* Scanlines */}
      <div className="absolute inset-0 nexus-scanlines" />

      {/* Network Lines */}

<div className="absolute inset-0">

<svg
  className="w-full h-full"
  viewBox="0 0 100 100"
  preserveAspectRatio="none"
>

  <line
    x1="20"
    y1="25"
    x2="30"
    y2="40"
    stroke="rgba(16,185,129,0.25)"
    strokeWidth="0.15"
  />

  <line
    x1="30"
    y1="40"
    x2="75"
    y2="35"
    stroke="rgba(34,211,238,0.25)"
    strokeWidth="0.15"
  />

  <line
    x1="75"
    y1="35"
    x2="65"
    y2="70"
    stroke="rgba(16,185,129,0.25)"
    strokeWidth="0.15"
  />

  <line
    x1="30"
    y1="40"
    x2="20"
    y2="75"
    stroke="rgba(34,211,238,0.25)"
    strokeWidth="0.15"
/>
</svg>

</div>

{/* Moving Data Packet */}

<motion.div
  animate={{
    left: ['20%', '30%', '75%', '65%', '20%'],
    top: ['25%', '40%', '35%', '70%', '25%'],
  }}
  transition={{
    duration: 6,
    repeat: Infinity,
    ease: 'linear',
  }}
  className="
    absolute
    w-3
    h-3
    rounded-full
    bg-emerald-400
    shadow-[0_0_20px_rgba(16,185,129,1)]
  "
/>

      {/* Scan Beam */}
<div className="absolute inset-0 overflow-hidden">

<motion.div
  animate={{
    x: ['-20%', '120%'],
  }}
  transition={{
    duration: 4,
    repeat: Infinity,
    ease: 'linear',
    repeatDelay: 2,
  }}
  className="
    absolute
    top-1/2
    left-1/2
    w-[1200px]
    h-[1200px]
    rotate-35
    bg-gradient-to-r
    from-transparent
    via-emerald-400/15
    to-transparent
    blur-2xl
  "
/>

</div>

{/* Floating Data Streams */}

<motion.div
  animate={{
    x: ['-10%', '110%'],
  }}
  transition={{
    duration: 8,
    repeat: Infinity,
    ease: 'linear',
  }}
  className="
    absolute
    top-[20%]
    h-[2px]
    w-[250px]
    bg-gradient-to-r
    from-transparent
    via-cyan-400/80
    to-transparent
    blur-[1px]
  "
/>

<motion.div
  animate={{
    x: ['110%', '-10%'],
  }}
  transition={{
    duration: 10,
    repeat: Infinity,
    ease: 'linear',
  }}
  className="
    absolute
    top-[60%]
    h-[2px]
    w-[300px]
    bg-gradient-to-r
    from-transparent
    via-emerald-400/80
    to-transparent
    blur-[1px]
  "
/>

<motion.div
  animate={{
    y: ['110%', '-10%'],
  }}
  transition={{
    duration: 12,
    repeat: Infinity,
    ease: 'linear',
  }}
  className="
    absolute
    right-[20%]
    w-[2px]
    h-[250px]
    bg-gradient-to-b
    from-transparent
    via-cyan-400/60
    to-transparent
    blur-[1px]
  "
/>

{/* HUD Labels */}

<motion.div
  animate={{
    opacity: [0.4, 1, 0.4],
  }}
  transition={{
    duration: 3,
    repeat: Infinity,
  }}
  className="
    absolute
    top-16
    left-16
    text-emerald-400/70
    font-mono
    text-xs
    tracking-[0.25em]
  "
>
  ACTIVE THREAT INTELLIGENCE
</motion.div>

<motion.div
  animate={{
    opacity: [0.3, 0.9, 0.3],
  }}
  transition={{
    duration: 4,
    repeat: Infinity,
  }}
  className="
    absolute
    top-28
    left-16
    text-cyan-400/70
    font-mono
    text-xs
    tracking-[0.25em]
  "
>
  LIVE RECON NETWORK
</motion.div>

<motion.div
  animate={{
    opacity: [0.3, 1, 0.3],
  }}
  transition={{
    duration: 5,
    repeat: Infinity,
  }}
  className="
    absolute
    bottom-16
    right-16
    text-emerald-400/70
    font-mono
    text-xs
    tracking-[0.25em]
  "
>
  ANALYSIS ONLINE
</motion.div>

{/* Activity Feed */}

<div
  className="
    absolute
    bottom-20
    right-16
    border
    border-cyan-500/20
    bg-black/20
    backdrop-blur-md
    rounded-xl
    px-4
    py-3
    min-w-[260px]
  "
>
  <div className="text-cyan-400 text-xs font-mono mb-2">
    LIVE ACTIVITY
  </div>

  <div className="space-y-1 text-xs font-mono text-zinc-300">

    <div>
      [12:41] Scan Started
    </div>

    <div>
      [12:42] Ports Discovered
    </div>

    <div>
      [12:43] Nuclei Running
    </div>

    <div>
      [12:44] Report Generated
    </div>

  </div>
</div>

{/* Threat Counter */}

<motion.div
  animate={{
    opacity: [0.5, 1, 0.5],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
  }}
  className="
    absolute
    top-16
    right-16
    border
    border-red-500/20
    bg-black/20
    backdrop-blur-md
    rounded-xl
    px-4
    py-3
  "
>
  <div className="text-red-400 text-xs font-mono">
    THREATS DETECTED
  </div>

  <div className="text-2xl font-bold text-red-400">
    127
  </div>
</motion.div>

{/* Live Nodes */}

<div
  className="
    absolute
    top-36
    right-16
    border
    border-cyan-500/20
    bg-black/20
    backdrop-blur-md
    rounded-xl
    px-4
    py-3
  "
>
  <div className="text-cyan-400 text-xs font-mono">
    LIVE NODES
  </div>

  <div className="text-2xl font-bold text-cyan-400">
    2,847
  </div>
</div>

{/* System Health */}

<div
  className="
    absolute
    bottom-20
    left-16
    border
    border-emerald-500/20
    bg-black/20
    backdrop-blur-md
    rounded-xl
    px-4
    py-3
    min-w-[220px]
  "
>
  <div className="text-emerald-400 text-xs font-mono mb-2">
    SYSTEM HEALTH
  </div>

  <div className="space-y-1 text-xs font-mono">
    <div className="text-emerald-300">
      ● API ONLINE
    </div>

    <div className="text-emerald-300">
      ● AI ENGINE READY
    </div>

    <div className="text-emerald-300">
      ● SCAN CLUSTER ACTIVE
    </div>
  </div>
</div>

<motion.span
  animate={{
    opacity: [0.3, 1, 0.3],
  }}
  transition={{
    duration: 1,
    repeat: Infinity,
  }}
  className="
    inline-block
    w-2
    h-2
    rounded-full
    bg-emerald-400
    mr-2
  "
/>

    </div>
  );
}