'use server';

/**
 * @fileOverview A natural language interpretation AI agent.
 *
 * - interpretNaturalLanguageCommand - A function that interprets and validates natural language input for defining automations.
 * - InterpretNaturalLanguageCommandInput - The input type for the interpretNaturalLanguageCommand function.
 * - InterpretNaturalLanguageCommandOutput - The return type for the interpretNaturalLanguageCommand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretNaturalLanguageCommandInputSchema = z.object({
  naturalLanguageCommand: z
    .string()
    .describe(
      'The natural language command to interpret and convert into actionable steps.'
    ),
});
export type InterpretNaturalLanguageCommandInput = z.infer<
  typeof InterpretNaturalLanguageCommandInputSchema
>;

const InterpretNaturalLanguageCommandOutputSchema = z.object({
  actionableSteps: z
    .string()
    .describe(
      'The actionable steps derived from the natural language command, in a format suitable for execution by the system.'
    ),
  validationResult: z
    .string()
    .describe(
      'The result of validating the natural language command. Should include confirmation if the command is valid, or specific error messages if invalid.'
    ),
});
export type InterpretNaturalLanguageCommandOutput = z.infer<
  typeof InterpretNaturalLanguageCommandOutputSchema
>;

export async function interpretNaturalLanguageCommand(
  input: InterpretNaturalLanguageCommandInput
): Promise<InterpretNaturalLanguageCommandOutput> {
  return interpretNaturalLanguageCommandFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interpretNaturalLanguageCommandPrompt',
  input: {schema: InterpretNaturalLanguageCommandInputSchema},
  output: {schema: InterpretNaturalLanguageCommandOutputSchema},
  prompt: `You are an AI automation agent that interprets natural language commands and converts them into actionable steps.

  Your task is to take the user's natural language input, validate it, and provide actionable steps that can be executed by the system.

  Natural Language Command: {{{naturalLanguageCommand}}}
  \n Output actionable steps and validation result. If the NL command cannot be converted, return an error in the validationResult.`,
});

const interpretNaturalLanguageCommandFlow = ai.defineFlow(
  {
    name: 'interpretNaturalLanguageCommandFlow',
    inputSchema: InterpretNaturalLanguageCommandInputSchema,
    outputSchema: InterpretNaturalLanguageCommandOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
