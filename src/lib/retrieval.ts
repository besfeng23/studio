'use server';

import {
  collection,
  query,
  where,
  getDocs,
  type Firestore,
} from 'firebase/firestore';

export type HistorySnippet = {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  createdAt: any;
};

// MVP: Simple keyword-based retrieval.
// In a real app, this would be replaced with vector search.
export async function runRetrieval(
  db: Firestore,
  searchQueries: string[]
): Promise<HistorySnippet[]> {
  if (searchQueries.length === 0) return [];

  // Simple implementation: for now, we just look for exact keywords in the text.
  // This is not efficient and should be replaced with a proper search index.
  const historyRef = collection(db, 'history');
  
  // To avoid fetching too many documents and doing client-side filtering,
  // we'll just use the first query term for a basic 'array-contains-any' like search.
  // Firestore doesn't support OR queries on different fields, so we simplify.
  const allKeywords = searchQueries.join(" ").split(" ").filter(Boolean);

  if (allKeywords.length === 0) return [];

  // This is still very basic. A real implementation would use a search service
  // like Algolia, or Firestore's upcoming vector search.
  const q = query(historyRef, where('thread_id', '==', 'default'));
  
  const querySnapshot = await getDocs(q);
  
  const snippets: HistorySnippet[] = [];
  const addedIds = new Set<string>();

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const text = data.text.toLowerCase();
    
    const hasKeyword = allKeywords.some(keyword => text.includes(keyword.toLowerCase()));

    if (hasKeyword && !addedIds.has(doc.id)) {
      snippets.push({
        id: doc.id,
        text: data.text,
        role: data.role,
        createdAt: data.createdAt,
      });
      addedIds.add(doc.id);
    }
  });

  return snippets;
}
