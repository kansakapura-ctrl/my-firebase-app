'use client';

import { type User } from 'firebase/auth';

const mockUser: User = {
  uid: 'demo-user-id',
  email: 'demo.user@example.com',
  displayName: 'Demo User',
  photoURL: 'https://i.pravatar.cc/150?u=demo-user',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  providerId: 'google.com',
  tenantId: null,
  delete: async () => console.log('delete mock user'),
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({} as any),
  reload: async () => console.log('reload mock user'),
  toJSON: () => ({}),
};

export function useUser() {
  return { user: mockUser, loading: false };
}
