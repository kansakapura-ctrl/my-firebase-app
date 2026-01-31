'use server';

import {
  createAgentFromPrompt,
  type CreateAgentFromPromptOutput,
} from '@/ai/flows/agent-creation-from-prompt';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const formSchema = z.object({
  prompt: z.string(),
});

export async function createAgentAction(values: z.infer<typeof formSchema>): Promise<{
  success: boolean;
  message: string;
  data?: CreateAgentFromPromptOutput;
}> {
  try {
    const validatedData = formSchema.parse(values);
    const result = await createAgentFromPrompt({
      prompt: validatedData.prompt,
    });

    console.log('Agent config generated:', result);

    return {
      success: true,
      message: 'Agent configuration generated!',
      data: result,
    };
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Invalid form data.' };
    }
    return {
      success: false,
      message: 'Failed to create agent. Please try again.',
    };
  }
}

const saveAgentSchema = z.object({
  uid: z.string(),
  displayName: z.string().nullable(),
  photoURL: z.string().url().nullable(),
  agentConfig: z.object({
    name: z.string(),
    description: z.string(),
    tasks: z.array(z.object({ name: z.string(), details: z.string() })),
  }),
});

export async function saveAgentAction(
  values: z.infer<typeof saveAgentSchema>
): Promise<{
  success: boolean;
  message: string;
  data?: { agentId: string };
}> {
  try {
    const { uid, displayName, photoURL, agentConfig } =
      saveAgentSchema.parse(values);
    const { firestore } = initializeFirebase();
    const agentCollection = collection(firestore, 'agents');

    const newAgentDoc = await addDoc(agentCollection, {
      ...agentConfig,
      uid,
      authorDisplayName: displayName,
      authorPhotoURL: photoURL,
      isPublic: false,
      downloads: 0,
      status: 'inactive',
      tasksCompleted: 0,
      lastRun: serverTimestamp(),
      createdAt: serverTimestamp(),
      avatar: String(Math.floor(Math.random() * 4) + 1),
    });

    return {
      success: true,
      message: 'Agent saved successfully!',
      data: { agentId: newAgentDoc.id },
    };
  } catch (error) {
    console.error('Error saving agent:', error);
    return {
      success: false,
      message: 'Failed to save agent. Please try again.',
    };
  }
}
