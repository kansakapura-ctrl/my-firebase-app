'use client';
import React, { useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';

export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const firebase = useMemo(() => initializeFirebase(), []);
  return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
};
