import { NextResponse, type NextRequest } from 'next/server';
import { answerQuestionsFromHistory } from '@/ai/flows/answer-questions-from-history';
import { z } from 'zod';

const ApiSchema = z.object({
  question: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).optional(),
  pins: z.array(z.object({
    content: z.string(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = ApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsed.error.format() }, { status: 400 });
    }

    const { question, history = [], pins = [] } = parsed.data;

    const conversationHistory = history
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');
    
    const pinsContext = pins.length > 0 
      ? `The user has pinned the following important points:\n${pins.map(p => `- ${p.content}`).join('\n')}`
      : 'No items are currently pinned.';

    const response = await answerQuestionsFromHistory({
      question,
      conversationHistory,
      pinsContext,
    });

    return NextResponse.json({ answer: response.answer });
  } catch (error) {
    console.error('[API /memory-chat]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
