// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview Generates a pronounceable password using AI.
 *
 * - generatePronounceablePassword - A function that generates a pronounceable password based on user preferences.
 * - GeneratePronounceablePasswordInput - The input type for the generatePronounceablePassword function.
 * - GeneratePronounceablePasswordOutput - The return type for the generatePronounceablePassword function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const GeneratePronounceablePasswordInputSchema = z.object({
  length: z.number().describe('The desired length of the password.'),
  useUppercase: z.boolean().describe('Whether to include uppercase letters.'),
  useLowercase: z.boolean().describe('Whether to include lowercase letters.'),
  useNumbers: z.boolean().describe('Whether to include numbers.'),
  useSymbols: z.boolean().describe('Whether to include symbols.'),
});

export type GeneratePronounceablePasswordInput = z.infer<
  typeof GeneratePronounceablePasswordInputSchema
>;

const GeneratePronounceablePasswordOutputSchema = z.object({
  password: z.string().describe('The generated pronounceable password.'),
});

export type GeneratePronounceablePasswordOutput = z.infer<
  typeof GeneratePronounceablePasswordOutputSchema
>;

export async function generatePronounceablePassword(
  input: GeneratePronounceablePasswordInput
): Promise<GeneratePronounceablePasswordOutput> {
  return generatePronounceablePasswordFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePronounceablePasswordPrompt',
  input: {schema: GeneratePronounceablePasswordInputSchema},
  output: {schema: GeneratePronounceablePasswordOutputSchema},
  prompt: `You are a password generator that creates pronounceable passwords.

  Based on the following criteria, generate a password that is easy to pronounce and remember.

  Password Length: {{length}}
  Include Uppercase Letters: {{#if useUppercase}}Yes{{else}}No{{/if}}
  Include Lowercase Letters: {{#if useLowercase}}Yes{{else}}No{{/if}}
  Include Numbers: {{#if useNumbers}}Yes{{else}}No{{/if}}
  Include Symbols: {{#if useSymbols}}Yes{{else}}No{{/if}}

  Ensure that the generated password is pronounceable by using common syllables and avoiding difficult letter combinations.
  Return only the password.`,
});

const generatePronounceablePasswordFlow = ai.defineFlow(
  {
    name: 'generatePronounceablePasswordFlow',
    inputSchema: GeneratePronounceablePasswordInputSchema,
    outputSchema: GeneratePronounceablePasswordOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
