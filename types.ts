
export type Category = "Note" | "Task" | "Inspiration" | "Meeting" | "Project" | "Question" | "All";

export type SubscriptionPlan = "Free" | "Pro" | "Enterprise";

export interface User {
  id: string;
  email: string;
  username: string;
  password?: string;
  isAdmin: boolean;
  notificationsEnabled: boolean;
  joinedAt: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionActive: boolean;
  paypalSubscriptionId?: string;
  hasCompletedTour: boolean;
}

export interface CMSAnnouncement {
  id: string;
  title: string;
  text: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Idea {
  id: string;
  userId: string; // Linked to owner
  content: string;
  source: "Voice" | "Typed";
  category: Category;
  tags: string[];
  createdAt: string;
  starred: boolean;
  aiSummary?: string;
}

export interface WebResult {
  title: string;
  uri: string;
  snippet?: string;
}

export interface Stats {
  total: number;
  voice: number;
  typed: number;
  today: number;
}

export type Tab = "capture" | "bank" | "search" | "stats" | "cms" | "users" | "settings" | "billing";
