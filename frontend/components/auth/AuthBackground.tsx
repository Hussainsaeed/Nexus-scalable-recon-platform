import { motion } from 'framer-motion';

export default function AuthBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10">

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

    </div>
  );
}