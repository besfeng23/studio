'use server';

/**
 * @fileOverview A flow to answer questions based on past conversation history.
 *
 * - answerQuestionsFromHistory - A function that handles answering questions from history.
 * - AnswerQuestionsFromHistoryInput - The input type for the answerQuestionsFromHistory function.
 * - AnswerQuestionsFromHistoryOutput - The return type for the answerQuestionsFromHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionsFromHistoryInputSchema = z.object({
  question: z.string().describe('The question to answer from past conversation history.'),
  conversationHistory: z.string().describe('The past conversation history to use for answering the question.'),
  pinsContext: z.string().describe('Summary of pins.'),
});
export type AnswerQuestionsFromHistoryInput = z.infer<typeof AnswerQuestionsFromHistoryInputSchema>;

const AnswerQuestionsFromHistoryOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, grounded in the conversation history and any pins.'),
});
export type AnswerQuestionsFromHistoryOutput = z.infer<typeof AnswerQuestionsFromHistoryOutputSchema>;

export async function answerQuestionsFromHistory(input: AnswerQuestionsFromHistoryInput): Promise<AnswerQuestionsFromHistoryOutput> {
  return answerQuestionsFromHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionsFromHistoryPrompt',
  input: {schema: AnswerQuestionsFromHistoryInputSchema},
  output: {schema: AnswerQuestionsFromHistoryOutputSchema},
  prompt: `You are a helpful assistant answering questions based on a conversation history.

  Answer the question using only the information from the conversation history and the pins. Be concise and to the point.

  Conversation History:
  {{conversationHistory}}

  Pins:
  {{pinsContext}}

  Question: {{question}}`,
});

const answerQuestionsFromHistoryFlow = ai.defineFlow(
  {
    name: 'answerQuestionsFromHistoryFlow',
    inputSchema: AnswerQuestionsFromHistoryInputSchema,
    outputSchema: AnswerQuestionsFromHistoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

