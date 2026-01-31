'use server';
/**
 * @fileOverview An AI agent that summarizes user feedback from Firestore.
 *
 * - summarizeFeedback - A function that analyzes and summarizes user feedback.
 * - SummarizeFeedbackInput - The input type for the summarizeFeedback function.
 * - SummarizeFeedbackOutput - The return type for the summarizeFeedback function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeFeedbackInputSchema = z.object({
  feedback: z
    .array(
      z.object({
        type: z.string(),
        comment: z.string(),
      })
    )
    .describe('An array of feedback objects from users.'),
});
export type SummarizeFeedbackInput = z.infer<
  typeof SummarizeFeedbackInputSchema
>;

export async function summarizeFeedback(
  input: SummarizeFeedbackInput
): Promise<string> {
  return summarizeFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFeedbackPrompt',
  input: { schema: SummarizeFeedbackInputSchema },
  output: { format: 'text' },
  prompt: `You are an AI assistant responsible for analyzing user feedback. You will be given a list of feedback items, each with a type (review, issue, bug, feature_request) and a comment.

Your task is to provide a concise summary of the feedback. The summary should be well-structured and include:
1. A general overview of user sentiment.
2. A breakdown of feedback by category (e.g., how many bugs, how many feature requests).
3. Key themes or recurring issues identified in the comments.
4. Actionable insights or suggestions for improvement based on the feedback.

Present the summary clearly.

Here is the feedback to analyze:
{{#each feedback}}
- Type: {{type}}, Comment: {{comment}}
{{/each}}
`,
});

const summarizeFeedbackFlow = ai.defineFlow(
  {
    name: 'summarizeFeedbackFlow',
    inputSchema: SummarizeFeedbackInputSchema,
    outputSchema: z.string(),
  },
  async input => {
    const { output } = await prompt(input);
    return output || 'No summary could be generated.';
  }
);
