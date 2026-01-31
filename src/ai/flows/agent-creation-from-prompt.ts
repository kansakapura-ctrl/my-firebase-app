'use server';

/**
 * @fileOverview Creates an AI automation agent from a natural language prompt.
 *
 * - createAgentFromPrompt - A function that creates an AI automation agent from a natural language prompt.
 * - CreateAgentFromPromptInput - The input type for the createAgentFromPrompt function.
 * - CreateAgentFromPromptOutput - The return type for the createAgentFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateAgentFromPromptInputSchema = z.object({
  prompt: z
    .string()
    .describe(
      'A natural language description of the desired AI automation agent.'
    ),
});
export type CreateAgentFromPromptInput = z.infer<
  typeof CreateAgentFromPromptInputSchema
>;

const CreateAgentFromPromptOutputSchema = z.object({
  name: z.string().describe('A short, descriptive name for the AI agent.'),
  description: z
    .string()
    .describe("A one-sentence description of the agent's purpose."),
  tasks: z
    .array(
      z.object({
        name: z
          .string()
          .describe(
            'A short, descriptive name for an action the agent will perform.'
          ),
        details: z
          .string()
          .describe('A one-sentence description of the action.'),
      })
    )
    .describe(
      'A list of 3-5 initial actions the agent will perform to accomplish its goal.'
    ),
});
export type CreateAgentFromPromptOutput = z.infer<
  typeof CreateAgentFromPromptOutputSchema
>;

export async function createAgentFromPrompt(
  input: CreateAgentFromPromptInput
): Promise<CreateAgentFromPromptOutput> {
  return createAgentFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createAgentFromPromptPrompt',
  input: {schema: CreateAgentFromPromptInputSchema},
  output: {schema: CreateAgentFromPromptOutputSchema},
  prompt: `You are an AI agent creation assistant. Your task is to generate a name, description, and a list of initial actions for an AI agent based on a user's prompt.

The name should be a short, descriptive title for the agent.
The description should be a concise, one-sentence summary of what the agent does.
The tasks should be a list of 3-5 initial actions the agent will perform to accomplish its goal.

User Prompt: {{{prompt}}}`,
});

const createAgentFromPromptFlow = ai.defineFlow(
  {
    name: 'createAgentFromPromptFlow',
    inputSchema: CreateAgentFromPromptInputSchema,
    outputSchema: CreateAgentFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
