import type { SVGProps } from "react";

export type IconName = "search" | "heart" | "menu" | "home" | "book" | "user" | "language" | "laptop" | "chart" | "palette" | "briefcase" | "health" | "grid" | "building" | "pin" | "clock" | "arrow" | "shield" | "users" | "bolt" | "headset" | "star";
const paths: Record<IconName, React.ReactNode> = {
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  heart: <path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/></>,
  book: <><path d="M12 5c-3-2-6-2-10-1v16c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1ZM12 5v16"/></>,
  user: <><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></>,
  language: <><path d="M2 5h12M8 2v3M4 5c0 5 4 9 9 11M12 5c0 5-4 9-9 11M14 21l4-11 4 11M15.5 17h5"/></>,
  laptop: <><rect x="4" y="3" width="16" height="14" rx="1.5"/><path d="M2 20h20M8 17l-1 3M16 17l1 3"/></>,
  chart: <><path d="M5 20v-6M12 20V9M19 20V3" strokeWidth="4"/></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18h1c2 0 3-2 1.5-3.5-1-1-.5-3 1.5-3h2c3 0 3-3 3-4.5A9 9 0 0 0 12 3Z"/><circle cx="7" cy="10" r=".8"/><circle cx="10" cy="6.5" r=".8"/><circle cx="15" cy="6.5" r=".8"/><circle cx="18" cy="10" r=".8"/></>,
  briefcase: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12c5 3 13 3 18 0M12 12v4"/></>,
  health: <><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/><path d="M2 12h5l2-4 3 8 2-4h8" stroke="white" strokeWidth="1.8"/></>,
  grid: <><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/></>,
  building: <><path d="M5 21V7l7-4 7 4v14M2 21h20M10 21v-5h4v5M8 8v2M16 8v2M8 12v2M16 12v2"/></>,
  pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
  shield: <><path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Z"/><path d="m8 12 3 3 5-6"/></>,
  users: <><circle cx="9" cy="7" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M17 4a3 3 0 0 1 0 6M18 13a5 5 0 0 1 4 5v3"/></>,
  bolt: <path d="m14 2-9 12h7l-2 8 9-12h-7Z"/>,
  headset: <><path d="M3 14v-3a9 9 0 0 1 18 0v3M21 17v1a4 4 0 0 1-4 4h-3"/><rect x="2" y="11" width="4" height="8" rx="2"/><rect x="18" y="11" width="4" height="8" rx="2"/></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>,
};
export function Icon({ name, className = "", ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`icon ${className}`} aria-hidden="true" {...props}>{paths[name]}</svg>;
}
