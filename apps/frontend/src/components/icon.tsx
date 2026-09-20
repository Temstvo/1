import type { SVGProps } from 'react';
export type IconName =
  | 'arrow'
  | 'shield'
  | 'globe'
  | 'device'
  | 'key'
  | 'check'
  | 'spark'
  | 'chevron'
  | 'menu'
  | 'copy'
  | 'power'
  | 'lock';
const paths: Record<IconName, React.ReactNode> = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  shield: (
    <>
      <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18M5 6.5c4 2 10 2 14 0M5 17.5c4-2 10-2 14 0" />
    </>
  ),
  device: (
    <>
      <rect x="3" y="4" width="13" height="12" rx="2" />
      <path d="M6 20h7m-4-4v4" />
      <rect x="16" y="10" width="5" height="10" rx="1" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="9" r="5" />
      <path d="m12 13 8 8m-4-4 3-3m-6 3 3-3" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  spark: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M15 8V4H4v11h4" />
    </>
  ),
  power: <path d="M12 3v9M6 6a8 8 0 1 0 12 0" />,
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </>
  ),
};
export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="34"
      height="34"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="13" fill="currentColor" />
      <path d="m10 27 8-16h5l7 16h-6l-4-9-4 9h-6Z" fill="#121714" />
      <path d="M16 26h8" stroke="#121714" strokeWidth="3" />
    </svg>
  );
}
