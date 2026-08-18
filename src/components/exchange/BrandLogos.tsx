import React from 'react';
import { Smartphone } from 'lucide-react';

export const AppleLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 170 170" fill="currentColor" className={className}>
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.07-7.65-7.85-11.87-14.34-5.9-9.16-10.45-19.78-13.65-31.85-3.2-12.08-4.8-23.2-4.8-33.36 0-14.88 3.73-27.17 11.2-36.87 7.46-9.7 17.15-14.73 29.07-15.08 4.58 0 9.8 1.25 15.66 3.75 5.86 2.5 9.74 3.79 11.64 3.87 1.57 0 5.75-1.4 12.54-4.19 6.79-2.79 12.37-3.95 16.74-3.48 12.44.82 22.45 5.73 30.03 14.73-10.87 6.56-16.19 15.65-15.96 27.27.23 9.07 3.77 16.66 10.63 22.76 6.86 6.1 14.93 9.53 24.22 10.3-2.12 6.35-4.66 12.65-7.62 18.91zM119.22 33.09c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 11.83-10.42 19.59-12.09.22 1.34.33 2.57.33 3.69 0 7.39-2.78 14.46-8.34 21.2-5.56 6.74-12.19 10.68-19.89 11.82-.45-1.34-.68-2.67-.68-3.95z" />
  </svg>
);

export const SamsungLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 120 40" fill="currentColor" className={className}>
    <text x="60" y="27" textAnchor="middle" fontSize="20" fontWeight="900" letterSpacing="1" fontFamily="system-ui, -apple-system, sans-serif">
      SAMSUNG
    </text>
  </svg>
);

export const OnePlusLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <rect width="100" height="100" rx="20" fill="#EB0029" />
    <path d="M42 22v56h-8V34h-6v-8h14z" fill="#FFFFFF" />
    <path d="M72 44h8v8h-8v8h-8v-8h-8v-8h8v-8h8v8z" fill="#FFFFFF" />
    <rect x="14" y="14" width="72" height="72" rx="10" stroke="#FFFFFF" strokeWidth="5" fill="none" />
  </svg>
);

export const XiaomiLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <rect width="100" height="100" rx="28" fill="#FF6900" />
    <path d="M30 32h14v16h12V32h14v36h-14V58H44v10H30V32z" fill="#FFFFFF" />
    <rect x="52" y="38" width="6" height="14" rx="2" fill="#FF6900" />
  </svg>
);

export const VivoLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 100 40" fill="none" className={className}>
    <text x="50" y="27" textAnchor="middle" fill="#008CEE" fontSize="25" fontWeight="900" fontStyle="italic" letterSpacing="1.5" fontFamily="system-ui, sans-serif">
      vivo
    </text>
  </svg>
);

export const OppoLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 100 40" fill="none" className={className}>
    <text x="50" y="27" textAnchor="middle" fill="#048A43" fontSize="23" fontWeight="900" letterSpacing="2" fontFamily="system-ui, sans-serif">
      OPPO
    </text>
  </svg>
);

export const RealmeLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <rect width="100" height="100" rx="24" fill="#FFC915" />
    <text x="50" y="68" textAnchor="middle" fill="#000000" fontSize="56" fontWeight="900" fontFamily="system-ui, sans-serif">
      r
    </text>
  </svg>
);

export const GoogleLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
    <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
    <path fill="#EA4335" d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 3.18 29.93 1 24 1 15.4 1 7.96 5.93 4.34 13.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
  </svg>
);

export const MotorolaLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <circle cx="50" cy="50" r="46" fill="#00142E" />
    <path d="M24 64c5-18 13-28 20-28 6 0 10 7 14 17 4-10 8-17 14-17 7 0 15 10 20 28-5-10-12-16-18-16-6 0-10 9-16 23-6-14-10-23-16-23-6 0-13 6-18 16z" fill="#008CEE" />
  </svg>
);

export const NothingLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <rect width="100" height="100" rx="20" fill="#18181B" stroke="#3F3F46" strokeWidth="2" />
    <text x="50" y="58" textAnchor="middle" fill="#FAFAFA" fontSize="32" fontWeight="bold" fontFamily="monospace" letterSpacing="1">
      (N)
    </text>
  </svg>
);

export const OtherLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <Smartphone className={className} />
);

export const BRAND_CATALOG: {
  name: string;
  logo: React.FC<{ className?: string }>;
  tagline: string;
  badgeBg: string;
}[] = [
  { name: 'Apple', logo: AppleLogo, tagline: 'iOS & iPhones', badgeBg: 'bg-slate-800 text-white' },
  { name: 'Samsung', logo: SamsungLogo, tagline: 'Galaxy Series', badgeBg: 'bg-blue-600/20 text-blue-400' },
  { name: 'OnePlus', logo: OnePlusLogo, tagline: 'Flagship & Nord', badgeBg: 'bg-rose-600/20 text-rose-400' },
  { name: 'Xiaomi', logo: XiaomiLogo, tagline: 'Mi, Redmi, POCO', badgeBg: 'bg-orange-600/20 text-orange-400' },
  { name: 'Vivo', logo: VivoLogo, tagline: 'X, V, T Series', badgeBg: 'bg-cyan-600/20 text-cyan-400' },
  { name: 'Oppo', logo: OppoLogo, tagline: 'Find, Reno, F', badgeBg: 'bg-emerald-600/20 text-emerald-400' },
  { name: 'Realme', logo: RealmeLogo, tagline: 'GT, Pro, Narzo', badgeBg: 'bg-amber-600/20 text-amber-400' },
  { name: 'Google Pixel', logo: GoogleLogo, tagline: 'Pixel Tensor', badgeBg: 'bg-indigo-600/20 text-indigo-400' },
  { name: 'Motorola', logo: MotorolaLogo, tagline: 'Edge, Razr, G', badgeBg: 'bg-sky-600/20 text-sky-400' },
  { name: 'Nothing', logo: NothingLogo, tagline: 'Phone (1), (2), (2a)', badgeBg: 'bg-zinc-800 text-zinc-200' },
  { name: 'Other', logo: OtherLogo, tagline: 'Custom Devices', badgeBg: 'bg-purple-600/20 text-purple-400' },
];
