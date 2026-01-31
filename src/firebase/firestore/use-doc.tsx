'use client';

import {
  onSnapshot,
  type DocumentReference,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useDoc<T>(docRef: DocumentReference | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      docRef,
      snapshot => {
        if (!snapshot.exists()) {
          setData(null);
          setLoading(false);
          return;
        }
        const data = { ...snapshot.data(), id: snapshot.id } as T;
        setData(data);
        setLoading(false);
      },
      async error => {
        const permissionError = new FirestorePermissionError({
          path: (docRef as DocumentReference).path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return { data, loading };
}
