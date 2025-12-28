"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, type Firestore, type DocumentData } from "firebase/firestore";

import { useFirestore } from '../provider';

export const useDoc = <T extends DocumentData>(firestorePath: string) => {
  const db = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) return;

    const docRef = doc(db, firestorePath);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, firestorePath]);

  return { data, loading, error };
};
