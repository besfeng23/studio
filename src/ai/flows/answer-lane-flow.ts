/**
 * @fileOverview The "deep" thinking lane. It synthesizes a final answer
 * based on the user's question and the context provided by memoryLane and retrieval.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the schema for a single retrieved history snippet.
const HistorySnippetSchema = z.object({
  id: z.string().describe('The unique ID of the history document.'),
  text: z.string().describe('The content of the message.'),
  role: z.enum(['user', 'assistant']).describe('Who sent the message.'),
});

export const AnswerLaneInputSchema = z.object({
  user_message: z.string().describe('The original raw message from the user.'),
  context_note: z
    .string()
    .describe('The up-to-date summary of the conversation from memoryLane.'),
  retrieved_history: z
    .array(HistorySnippetSchema)
    .describe(
      'A list of relevant message snippets retrieved from the full conversation history.'
    ),
  pins: z.array(z.string()).describe('A list of important pinned items.'),
});
export type AnswerLaneInput = z.infer<typeof AnswerLaneInputSchema>;

export const AnswerLaneOutputSchema = z.object({
  reply_text: z.string().describe('The final, synthesized reply to the user.'),
  source_ids: z
    .array(z.string())
    .describe(
      'An array of document IDs from the `retrieved_history` that were actually used to construct the reply.'
    ),
  next_action: z
    .string()
    .optional()
    .describe('A suggested next action for the user, if any.'),
});
export type AnswerLaneOutput = z.infer<typeof AnswerLaneOutputSchema>;

const answerLanePrompt = ai.definePrompt({
  name: 'answerLanePrompt',
  input: { schema: AnswerLaneInputSchema },
  output: { schema: AnswerLaneOutputSchema },
  prompt: `You are the deep-thinking, reasoning part of an AI assistant. Your job is to synthesize a final, accurate, and concise answer for the user based on the context provided.

**Strict Rules:**
1.  **No Hallucination:** You MUST ground your answer ONLY in the information provided in the "Retrieved History" and "Pinned Items".
2.  **Check History First:** Before answering, check if the retrieved history contains information relevant to the user's question.
3.  **Exact "Cannot Find" Response:** If the user asks about a past event, decision, or detail, and the "Retrieved History" is empty or does not contain the answer, you MUST reply with the following sentence EXACTLY: "I cannot find that in our history. Please restate or provide more details." Do not apologize or add any other text.
4.  **Be Concise:** Provide a short, direct reply. Default to a "Short" reply style unless the user asks for more detail.
5.  **Cite Sources:** Your reply must be backed by the provided history. Populate the \`source_ids\` field with the IDs of the history snippets you used.

**Provided Context ("Memory Pack"):**

**1. Overall Context Note:**
{{context_note}}

**2. Pinned Items:**
{{#if pins}}
  {{#each pins}}
  - {{this}}
  {{/each}}
{{else}}
None
{{/if}}

**3. Retrieved History (Your Primary Source of Truth):**
{{#if retrieved_history}}
  {{#each retrieved_history}}
  [ID: {{id}}] {{role}}: {{text}}
  {{/each}}
{{else}}
(No relevant history found)
{{/if}}

**4. The User's Latest Message:**
"{{user_message}}"

**Your Task:**
Based on all the information above and adhering strictly to the rules, generate the final reply for the user. Produce ONLY the JSON output.`,
});

export const answerLaneFlow = ai.defineFlow(
  {
    name: 'answerLaneFlow',
    inputSchema: AnswerLaneInputSchema,
    outputSchema: AnswerLaneOutputSchema,
  },
  async (input) => {
    // No-Hallucination Rule Check
    const isQuestionAboutPast = /what|who|when|where|why|how|did we|tell me about/.test(input.user_message.toLowerCase());
    if (isQuestionAboutPast && input.retrieved_history.length === 0) {
        return {
            reply_text: "I cannot find that in our history. Please restate or provide more details.",
            source_ids: [],
        };
    }
    
    const { output } = await answerLanePrompt(input);
    if (!output) {
      throw new Error('answerLaneFlow failed to produce output.');
    }
    return output;
  }
);
