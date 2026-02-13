
import React from 'react';
import { 
  StickyNote, 
  CheckSquare, 
  Lightbulb, 
  Users, 
  Briefcase, 
  HelpCircle, 
  Search,
  PlusCircle,
  Database,
  BarChart3,
  Settings,
  ShieldAlert,
  CreditCard,
  Mic,
  Keyboard,
  UserCog
} from 'lucide-react';
import { Category, Tab } from './types';

export const CATEGORIES: Category[] = ["Note", "Task", "Inspiration", "Meeting", "Project", "Question"];

export const CATEGORY_COLORS: Record<string, string> = {
  Note: "border-slate-500 text-slate-400 bg-slate-500/10",
  Task: "border-emerald-500 text-emerald-400 bg-emerald-500/10",
  Inspiration: "border-amber-500 text-amber-400 bg-amber-500/10",
  Meeting: "border-violet-500 text-violet-400 bg-violet-500/10",
  Project: "border-cyan-500 text-cyan-400 bg-cyan-500/10",
  Question: "border-rose-500 text-rose-400 bg-rose-500/10",
  // Fallbacks for sources if needed
  Voice: "border-violet-500 text-violet-400 bg-violet-500/10",
  Typed: "border-cyan-500 text-cyan-400 bg-cyan-500/10",
};

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Note: <StickyNote size={14} />,
  Task: <CheckSquare size={14} />,
  Inspiration: <Lightbulb size={14} />,
  Meeting: <Users size={14} />,
  Project: <Briefcase size={14} />,
  Question: <HelpCircle size={14} />,
  Voice: <Mic size={14} />,
  Typed: <Keyboard size={14} />,
};

export const TABS: { id: Tab; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
  { id: 'capture', label: 'Capture', icon: <PlusCircle size={20} /> },
  { id: 'bank', label: 'Bank', icon: <Database size={20} /> },
  { id: 'search', label: 'Search', icon: <Search size={20} /> },
  { id: 'stats', label: 'Stats', icon: <BarChart3 size={20} /> },
  { id: 'cms', label: 'CMS', icon: <ShieldAlert size={20} />, adminOnly: true },
  { id: 'users', label: 'Users', icon: <UserCog size={20} />, adminOnly: true },
  { id: 'billing', label: 'Billing', icon: <CreditCard size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

export const STORAGE_KEYS = {
  IDEAS: "ideaflow_ideas",
  USERS: "ideaflow_users",
  AUTH: "ideaflow_current_user",
  CMS: "ideaflow_cms_content"
};
