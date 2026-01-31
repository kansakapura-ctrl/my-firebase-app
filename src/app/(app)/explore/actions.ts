'use server';

import { z } from 'zod';
import {
  doc,
  getDoc,
  collection,
  serverTimestamp,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { revalidatePath } from 'next/cache';
import type { Agent } from '@/lib/data';

const downloadAgentSchema = z.object({
  agentId: z.string(),
  uid: z.string(),
});

type DownloadAgentResult = {
  success: boolean;
  message: string;
  data?: { newAgentId: string };
};

export async function downloadAgentAction(
  values: z.infer<typeof downloadAgentSchema>
): Promise<DownloadAgentResult> {
  try {
    const { agentId, uid } = downloadAgentSchema.parse(values);
    const { firestore } = initializeFirebase();

    // 1. Get the public agent to download
    const publicAgentRef = doc(firestore, 'agents', agentId);
    const publicAgentSnap = await getDoc(publicAgentRef);

    if (!publicAgentSnap.exists() || !publicAgentSnap.data().isPublic) {
      return { success: false, message: 'This agent is not public.' };
    }

    const publicAgentData = publicAgentSnap.data() as Agent;

    // A user cannot download their own agent
    if (publicAgentData.uid === uid) {
        return { success: false, message: 'You cannot download your own agent.' };
    }

    // Use a batch to perform multiple writes atomically
    const batch = writeBatch(firestore);

    // 2. Create a new agent document for the current user
    const newAgentCollectionRef = collection(firestore, 'agents');
    const newAgentRef = doc(newAgentCollectionRef); // Create a new doc with a generated ID

    batch.set(newAgentRef, {
      name: publicAgentData.name,
      description: publicAgentData.description,
      tasks: publicAgentData.tasks,
      avatar: publicAgentData.avatar,
      authorDisplayName: publicAgentData.authorDisplayName,
      authorPhotoURL: publicAgentData.authorPhotoURL,
      originalAgentId: publicAgentSnap.id, // Keep track of the original
      uid: uid, // Set the new owner
      isPublic: false,
      downloads: 0,
      status: 'inactive',
      tasksCompleted: 0,
      lastRun: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    // 3. Atomically increment the download count on the original agent
    batch.update(publicAgentRef, {
      downloads: increment(1),
    });
    
    // Commit the batch
    await batch.commit();

    revalidatePath('/agents');
    revalidatePath('/explore');

    return {
      success: true,
      message: 'Agent downloaded successfully!',
      data: { newAgentId: newAgentRef.id },
    };
  } catch (error) {
    console.error('Error downloading agent:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Invalid data.' };
    }
    return {
      success: false,
      message: 'Failed to download agent. Please try again.',
    };
  }
}
