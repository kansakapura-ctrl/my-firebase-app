'use server';

import { interpretNaturalLanguageCommand } from '@/ai/flows/interpret-natural-language-command';
import { z } from 'zod';
import { initializeFirebase } from '@/firebase';
import {
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  writeBatch,
  collection,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { Agent } from '@/lib/data';

const interpretFormSchema = z.object({
  command: z.string(),
  agentId: z.string(),
  uid: z.string(),
});

type InterpretationResult = {
  actionableSteps: string;
  validationResult: string;
};

type InterpretActionResult = {
  success: boolean;
  message: string;
  data?: InterpretationResult;
};

export async function interpretCommandAction(
  values: z.infer<typeof interpretFormSchema>
): Promise<InterpretActionResult> {
  try {
    const validatedData = interpretFormSchema.parse(values);
    const { command, agentId, uid } = validatedData;

    // First, verify ownership
    const { firestore } = initializeFirebase();
    const agentRef = doc(firestore, 'agents', agentId);
    const agentSnap = await getDoc(agentRef);

    if (!agentSnap.exists() || agentSnap.data().uid !== uid) {
      return {
        success: false,
        message: 'Permission denied. You do not own this agent.',
      };
    }

    // If owner, proceed to interpret the command
    const result = await interpretNaturalLanguageCommand({
      naturalLanguageCommand: command,
    });

    // In a real app, you would add these steps to the agent's workflow in the DB.
    // For now, we'll just log and return.
    console.log('Interpreted command:', result);

    const interpretedTasks = {
      name: result.actionableSteps,
      details: result.validationResult,
    };

    await updateDoc(agentRef, {
      tasks: arrayUnion(interpretedTasks),
    });

    revalidatePath(`/agents/${agentId}`);

    return {
      success: true,
      message: 'Command interpreted and new task added!',
      data: result,
    };
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Invalid form data.' };
    }
    return {
      success: false,
      message: 'Failed to interpret command. Please try again.',
    };
  }
}

const publishFormSchema = z.object({
  agentId: z.string(),
  uid: z.string(),
});

type PublishActionResult = {
  success: boolean;
  message: string;
};

export async function publishAgentAction(
  values: z.infer<typeof publishFormSchema>
): Promise<PublishActionResult> {
  try {
    const { agentId, uid } = publishFormSchema.parse(values);
    const { firestore } = initializeFirebase();
    const agentRef = doc(firestore, 'agents', agentId);
    const agentSnap = await getDoc(agentRef);

    if (!agentSnap.exists() || agentSnap.data().uid !== uid) {
      return {
        success: false,
        message: 'Permission denied. You do not own this agent.',
      };
    }

    await updateDoc(agentRef, {
      isPublic: true,
    });

    revalidatePath(`/agents/${agentId}`);
    revalidatePath('/explore');

    return { success: true, message: 'Agent published successfully!' };
  } catch (error) {
    console.error('Error publishing agent:', error);
    return {
      success: false,
      message: 'Failed to publish agent. Please try again.',
    };
  }
}

const runAgentSchema = z.object({
  agentId: z.string(),
  uid: z.string(),
});

type RunAgentResult = {
  success: boolean;
  message: string;
  data?: {
    tasksRun: number;
    tasksSucceeded: number;
  };
};

export async function runAgentAction(
  values: z.infer<typeof runAgentSchema>
): Promise<RunAgentResult> {
  try {
    const { agentId, uid } = runAgentSchema.parse(values);
    const { firestore } = initializeFirebase();

    // 1. Verify ownership and get agent data
    const agentRef = doc(firestore, 'agents', agentId);
    const agentSnap = await getDoc(agentRef);

    if (!agentSnap.exists() || agentSnap.data().uid !== uid) {
      return {
        success: false,
        message: 'Permission denied. You do not own this agent.',
      };
    }
    const agent = agentSnap.data() as Agent;

    if (!agent.tasks || agent.tasks.length === 0) {
      return { success: false, message: 'This agent has no tasks to run.' };
    }

    // 2. Use a batch to perform all writes atomically
    const batch = writeBatch(firestore);
    const logsCollection = collection(firestore, 'logs');
    let tasksSucceeded = 0;

    // 3. Simulate running each task and create a log entry
    agent.tasks.forEach(task => {
      const newLogRef = doc(logsCollection);
      const isSuccess = Math.random() > 0.2; // 80% success rate for demo
      if (isSuccess) tasksSucceeded++;

      batch.set(newLogRef, {
        uid,
        agentId,
        agentName: agent.name,
        taskName: task.name,
        status: isSuccess ? 'success' : 'failure',
        details: isSuccess
          ? 'Task completed successfully.'
          : 'Failed to execute task. Please check configuration.',
        timestamp: serverTimestamp(),
      });
    });

    // 4. Update the agent's status
    batch.update(agentRef, {
      lastRun: serverTimestamp(),
      tasksCompleted: increment(tasksSucceeded),
    });

    // 5. Commit all changes
    await batch.commit();

    revalidatePath(`/agents/${agentId}`);
    revalidatePath('/agents');
    revalidatePath('/logs');

    return {
      success: true,
      message: `Agent run complete. ${tasksSucceeded} of ${agent.tasks.length} tasks succeeded.`,
      data: {
        tasksRun: agent.tasks.length,
        tasksSucceeded,
      },
    };
  } catch (error) {
    console.error('Error running agent:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while running the agent.',
    };
  }
}
