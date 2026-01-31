import type { LucideIcon } from 'lucide-react';
import type { User } from 'firebase/auth';

export type Agent = {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  tasks: { name: string; details: string }[];
  tasksCompleted: number;
  lastRun: Date | { toDate: () => Date };
  createdAt: Date | { toDate: () => Date };
  avatar: string;
  uid: string;
  isPublic?: boolean;
  downloads?: number;
  authorDisplayName?: string | null;
  authorPhotoURL?: string | null;
  originalAgentId?: string;
};

export type UserProfile = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: Date | { toDate: () => Date };
};

export type Log = {
  id: string;
  uid: string;
  agentId: string;
  agentName: string;
  taskName: string;
  status: 'success' | 'failure';
  details: string;
  timestamp: Date | { toDate: () => Date };
};

export type Trigger = {
  id:string;
  type: 'schedule' | 'webhook' | 'event';
  name: string;
  description: string;
  icon: LucideIcon;
};

export type Action = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
};

// This data is now fetched from Firestore.
export const agents: Agent[] = [];

export const logs: Log[] = [];
