'use server';

import { answerQuestionsFromHistory } from '@/ai/flows/answer-questions-from-history';
import { summarizeConversation } from '@/ai/flows/summarize-conversation';
import type { Message } from './types';

// In a real application, you would initialize and use the Firebase Admin SDK here
// to persist messages to Firestore.
// import { db } from './firebase-admin';

async function saveMessageToFirestore(message: Message) {
  console.log('Saving message to Firestore (mocked):', message.content);
  // Example: await db.collection('chats').doc('chatId').collection('messages').add(message);
  return;
}

export async function handleUserMessage(
  history: Message[],
  pins: Message[],
  userInput: string
): Promise<Message> {
  const userMessage: Message = {
    id: crypto.randomUUID(),
    role: 'user',
    content: userInput,
    timestamp: new Date(),
  };

  // Mock saving to Firestore
  await saveMessageToFirestore(userMessage);

  const fullHistory = [...history, userMessage];

  // Command handling
  if (userInput.toLowerCase().startsWith('/recap')) {
    const conversationHistory = fullHistory
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');
    const { summary } = await summarizeConversation({ conversationHistory });
    return {
      id: crypto.randomUUID(),
      role: 'system',
      content: `Recap of the conversation:\n\n${summary}`,
      timestamp: new Date(),
    };
  }

  // AI interaction
  try {
    const conversationHistory = fullHistory
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');
    
    const pinsContext = pins.length > 0 
      ? `The user has pinned the following important points:\n${pins.map(p => `- ${p.content}`).join('\n')}`
      : 'No items are currently pinned.';

    const response = await answerQuestionsFromHistory({
      question: userInput,
      conversationHistory,
      pinsContext,
    });

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response.answer,
      timestamp: new Date(),
    };

    // Mock saving assistant message
    await saveMessageToFirestore(assistantMessage);

    return assistantMessage;
  } catch (error) {
    console.error('Error processing AI response:', error);
    return {
      id: crypto.randomUUID(),
      role: 'system',
      content: 'Sorry, I encountered an error. Please try again.',
      timestamp: new Date(),
    };
  }
}
