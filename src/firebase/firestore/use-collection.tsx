"use client";

import { useEffect, useState, useRef } from "react";
import {
  onSnapshot,
  query,
  collection,
  where,
  type Firestore,
  type DocumentData,
  type Query,
} from "firebase/firestore";

import { useFirestore } from '../provider';

type UseCollectionOptions = {
  field?: string;
  operator?: any;
  value?: string;
};

export const useCollection = <T extends DocumentData>(
  firestorePath: string,
  options?: UseCollectionOptions
) => {
  const db = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const optionsRef = useRef(options);

  useEffect(() => {
    if (!db) return;

    let q: Query;
    const collectionRef = collection(db, firestorePath);

    if (optionsRef.current?.field && optionsRef.current.operator && optionsRef.current.value) {
      q = query(
        collectionRef,
        where(optionsRef.current.field, optionsRef.current.operator, optionsRef.current.value)
      );
    } else {
      q = query(collectionRef);
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
        setData(docs);
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
