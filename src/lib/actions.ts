'use server';

import {
  addDoc,
  collection,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import type { Message } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export async function saveMessage(
  db: Firestore,
  message: Omit<Message, 'id' | 'timestamp' | 'isPinned'>
) {
  try {
    const docRef = await addDoc(collection(db, 'history'), {
      ...message,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving message to Firestore:', error);
    const permissionError = new FirestorePermissionError({
      path: 'history',
      operation: 'create',
      requestResourceData: message,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw new Error('FIRESTORE ERROR');
  }
}
