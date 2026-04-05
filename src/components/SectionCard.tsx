import { ReactNode } from "react";

interface SectionCardProps {
  children: ReactNode;
  noPadding?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function SectionCard({ children, noPadding, className = "", style }: SectionCardProps) {
  return (
    <div
      className={`border border-neutral-200 rounded-xl bg-white ${noPadding ? "overflow-hidden" : ""} ${className}`}
      style={{ ...(!noPadding ? { padding: "24px" } : {}), ...style }}
    >
      {children}
    </div>
  );
}
