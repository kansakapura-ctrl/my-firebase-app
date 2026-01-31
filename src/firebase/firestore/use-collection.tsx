'use client';
import {
  onSnapshot,
  type Query,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useCollection<T>(query: Query | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query,
      snapshot => {
        const docs = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as T[];
        setData(docs);
        setLoading(false);
      },
      async error => {
        const permissionError = new FirestorePermissionError({
          path: (query as Query).path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading };
}
