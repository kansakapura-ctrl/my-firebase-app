'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: Error) => {
      // In a real app, you might use a toast to show the error.
      // For this dev environment, we throw it to show the Next.js overlay.
      console.error(
        'A Firestore permission error occurred. Check your security rules.'
      );
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null;
}
