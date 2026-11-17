import React from 'react';
import {
  FileText,
  ExternalLink,
  Download,
  Video,
  MapPin,
  Award,
  ClipboardList,
  Globe,
  Calendar,
  FolderOpen,
  Users,
  Link as LinkIcon
} from 'lucide-react';

export type MicrositeItemType = 'form' | 'shortlink' | 'external' | 'header';
export type MicrositeThemeId = 'toska' | 'navy' | 'light' | 'dark';
export type MicrositeLogoType = 'pemkab' | 'gsd' | 'none';

export interface MicrositeLinkItem {
  id: string;
  type: MicrositeItemType;
  title: string;
  url: string;
  form_slug?: string;
  short_code?: string;
  icon?: string;
  badge?: string;
  is_active: boolean;
  is_form_active?: boolean;
}

export interface MicrositeThemeConfig {
  theme: MicrositeThemeId;
  logo: MicrositeLogoType;
}

export interface MicrositeData {
  id?: number;
  title: string;
  slug: string;
  description: string;
  theme_config: MicrositeThemeConfig;
  links_item: MicrositeLinkItem[];
  is_active: number | boolean;
  view_count?: number;
  created_at?: string;
}

export const MICROSITE_THEMES: Record<
  MicrositeThemeId,
  {
    name: string;
    previewSwatch: string;
    pageBg: string;
    cardBg: string;
    titleColor: string;
    descColor: string;
    headerTextColor: string;
    buttonBg: string;
    buttonHover: string;
    buttonText: string;
    iconBoxBg: string;
    iconColor: string;
    badgeBg: string;
    footerText: string;
  }
> = {
  toska: {
    name: 'Garut Satu Data Toska',
    previewSwatch: 'bg-gradient-to-br from-[#008374] to-[#005a50]',
    pageBg: 'bg-gradient-to-b from-[#008374] via-[#00695c] to-[#004d40]',
    cardBg: 'bg-white/10 backdrop-blur-md border border-white/15',
    titleColor: 'text-white',
    descColor: 'text-teal-50/90',
    headerTextColor: 'text-teal-100/90 border-teal-200/20',
    buttonBg: 'bg-white text-slate-900 shadow-sm border border-white/80',
    buttonHover: 'hover:bg-teal-50 hover:-translate-y-0.5 active:scale-[0.98]',
    buttonText: 'text-slate-900',
    iconBoxBg: 'bg-teal-50',
    iconColor: 'text-[#008374]',
    badgeBg: 'bg-[#008374] text-white',
    footerText: 'text-teal-100/80',
  },
  navy: {
    name: 'Royal Navy Formal',
    previewSwatch: 'bg-gradient-to-br from-slate-900 to-blue-950',
    pageBg: 'bg-gradient-to-b from-[#0f172a] via-[#172554] to-[#0f172a]',
    cardBg: 'bg-white/5 backdrop-blur-md border border-blue-300/15',
    titleColor: 'text-white',
    descColor: 'text-blue-100/80',
    headerTextColor: 'text-blue-200/80 border-blue-400/20',
    buttonBg: 'bg-white text-slate-900 shadow-sm border border-slate-100',
    buttonHover: 'hover:bg-blue-50 hover:-translate-y-0.5 active:scale-[0.98]',
    buttonText: 'text-slate-900',
    iconBoxBg: 'bg-blue-50',
    iconColor: 'text-blue-700',
    badgeBg: 'bg-blue-700 text-white',
    footerText: 'text-blue-200/70',
  },
  light: {
    name: 'Clean Modern Light',
    previewSwatch: 'bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300',
    pageBg: 'bg-slate-50',
    cardBg: 'bg-white border border-slate-200/80 shadow-xs',
    titleColor: 'text-slate-900',
    descColor: 'text-slate-600',
    headerTextColor: 'text-slate-500 border-slate-200',
    buttonBg: 'bg-white text-slate-800 border border-slate-200 shadow-xs',
    buttonHover: 'hover:border-brand-primary hover:bg-slate-50 hover:-translate-y-0.5 active:scale-[0.98]',
    buttonText: 'text-slate-800',
    iconBoxBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
    badgeBg: 'bg-brand-primary text-white',
    footerText: 'text-slate-400',
  },
  dark: {
    name: 'Dark Glassmorphism',
    previewSwatch: 'bg-gradient-to-br from-zinc-900 to-neutral-950',
    pageBg: 'bg-zinc-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/40 via-zinc-950 to-black',
    cardBg: 'bg-white/5 backdrop-blur-xl border border-white/10',
    titleColor: 'text-white',
    descColor: 'text-zinc-300',
    headerTextColor: 'text-zinc-400 border-white/10',
    buttonBg: 'bg-white/10 backdrop-blur-md text-white border border-white/15',
    buttonHover: 'hover:bg-white/15 hover:border-white/25 hover:-translate-y-0.5 active:scale-[0.98]',
    buttonText: 'text-white',
    iconBoxBg: 'bg-white/10',
    iconColor: 'text-brand-primary',
    badgeBg: 'bg-brand-primary text-slate-950',
    footerText: 'text-zinc-500',
  },
};

export const MICROSITE_ICON_OPTIONS = [
  { id: 'FileText', label: 'Dokumen' },
  { id: 'ClipboardList', label: 'Formulir / Absen' },
  { id: 'Download', label: 'Unduh Materi' },
  { id: 'Video', label: 'Video / Zoom' },
  { id: 'ExternalLink', label: 'Tautan Luar' },
  { id: 'FolderOpen', label: 'Folder Drive' },
  { id: 'Globe', label: 'Website' },
  { id: 'MapPin', label: 'Lokasi' },
  { id: 'Calendar', label: 'Jadwal' },
  { id: 'Award', label: 'Sertifikat' },
  { id: 'Users', label: 'Peserta' },
  { id: 'Link', label: 'Link' },
];

export function renderMicrositeIcon(iconName?: string, size = 18): React.ReactNode {
  switch (iconName) {
    case 'FileText':
      return React.createElement(FileText, { size });
    case 'ClipboardList':
      return React.createElement(ClipboardList, { size });
    case 'Download':
      return React.createElement(Download, { size });
    case 'Video':
      return React.createElement(Video, { size });
    case 'MapPin':
      return React.createElement(MapPin, { size });
    case 'Award':
      return React.createElement(Award, { size });
    case 'Globe':
      return React.createElement(Globe, { size });
    case 'Calendar':
      return React.createElement(Calendar, { size });
    case 'FolderOpen':
      return React.createElement(FolderOpen, { size });
    case 'Users':
      return React.createElement(Users, { size });
    case 'Link':
      return React.createElement(LinkIcon, { size });
    case 'ExternalLink':
    default:
      return React.createElement(ExternalLink, { size });
  }
}
