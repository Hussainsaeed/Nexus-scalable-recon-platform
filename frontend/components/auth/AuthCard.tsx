import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function AuthCard({
  children,
}: Props) {

  return (

    <div
      className="
        w-full
        max-w-md
        backdrop-blur-xl
        bg-white/5
        border
        border-white/10
        rounded-3xl
        p-8
        shadow-2xl
      "
    >
      {children}
    </div>

  );
}