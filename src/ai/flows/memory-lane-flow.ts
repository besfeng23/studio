/**
 * @fileOverview The "fast" lane for processing user input.
 * It categorizes intent, updates context, and determines if clarification is needed.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const MemoryLaneInputSchema = z.object({
  user_message: z.string().describe('The raw message from the user.'),
  context_note: z
    .string()
    .describe('The current summary of the conversation.'),
  last_state: z
    .any()
    .describe(
      'The last known state, including `last_user_message` and `last_assistant_reply`.'
    ),
  pins: z.array(z.string()).describe('A list of important pinned items.'),
});
export type MemoryLaneInput = z.infer<typeof MemoryLaneInputSchema>;

export const MemoryLaneOutputSchema = z.object({
  new_context_note: z
    .string()
    .describe(
      'An updated, concise summary of the conversation including the new user message.'
    ),
  updated_pins: z
    .array(z.string())
    .optional()
    .describe(
      'If the user wanted to pin or unpin something, this is the complete new list of pins.'
    ),
  search_queries: z
    .array(z.string())
    .describe(
      'A list of 3-5 keywords or short phrases to search for in the conversation history to find relevant context for the `answerLane`.'
    ),
  intent_category: z
    .enum(['chat', 'command', 'decision'])
    .describe(
      'Categorize the user intent. "command" is for actions like /recap or /pin. "decision" is for logging a formal decision. "chat" is for everything else.'
    ),
  needs_clarification: z
    .boolean()
    .describe(
      'True if the user`s message is too ambiguous to proceed without more information.'
    ),
  clarifying_question: z
    .string()
    .optional()
    .describe(
      'If `needs_clarification` is true, provide exactly one, simple question to ask the user to resolve the ambiguity. This question will be shown to the user as the entire response.'
    ),
});
export type MemoryLaneOutput = z.infer<typeof MemoryLaneOutputSchema>;

const memoryLanePrompt = ai.definePrompt({
  name: 'memoryLanePrompt',
  input: { schema: MemoryLaneInputSchema },
  output: { schema: MemoryLaneOutputSchema },
  prompt: `You are the fast-thinking part of an AI assistant's brain. Your job is to quickly analyze the user's latest message and prepare the groundwork for the "deep-thinking" part of the brain (the answerLane).

Analyze the user's message in the context of the conversation summary, the last turn, and any pinned items.

**Current Conversation Summary (Context Note):**
{{context_note}}

**Pinned Items:**
{{#if pins}}
  {{#each pins}}
  - {{this}}
  {{/each}}
{{else}}
None
{{/if}}

**Last Interaction:**
User: {{last_state.last_user_message}}
Assistant: {{last_state.last_assistant_reply}}

**New User Message:**
"{{user_message}}"

**Your Tasks:**

1.  **Update Context Note:** Revise the "Current Conversation Summary" to be a new, a single-paragraph summary that incorporates the user's latest message. Keep it concise.
2.  **Manage Pins:** If the user's message implies adding or removing a pin, update the list of pins accordingly. Otherwise, leave it alone.
3.  **Categorize Intent:** Classify the user's intent as "chat" (normal conversation), "command" (e.g., /recap, /pin), or "decision" (when the user wants to formally record a decision with /decision).
4.  **Generate Search Queries:** Create a list of 3-5 keywords or short phrases. These will be used to search the full conversation history for relevant details. They should be targeted and specific to the user's message.
5.  **Check for Ambiguity:** Is the user's message unclear, vague, or missing key information?
    *   If **YES**, set \`needs_clarification\` to \`true\` and formulate a **single, direct clarifying question**. Do not offer options.
    *   If **NO**, set \`needs_clarification\` to \`false\`.

Produce ONLY the JSON output, with no additional text or explanations.`,
});

export const memoryLaneFlow = ai.defineFlow(
  {
    name: 'memoryLaneFlow',
    inputSchema: MemoryLaneInputSchema,
    outputSchema: MemoryLaneOutputSchema,
  },
  async (input) => {
    const { output } = await memoryLanePrompt(input);
    if (!output) {
      throw new Error('memoryLaneFlow failed to produce output.');
    }
    return output;
  }
);
