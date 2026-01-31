'use server';

import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const formSchema = z.object({
  type: z.string(),
  comment: z.string(),
});

export async function submitFeedbackAction(
  values: z.infer<typeof formSchema>
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const validatedData = formSchema.parse(values);
    const { firestore } = initializeFirebase();
    const feedbackCollection = collection(firestore, 'feedback');

    addDoc(feedbackCollection, {
      ...validatedData,
      createdAt: serverTimestamp(),
    }).catch(async serverError => {
      const permissionError = new FirestorePermissionError({
        path: feedbackCollection.path,
        operation: 'create',
        requestResourceData: validatedData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    return {
      success: true,
      message: 'Feedback submitted successfully.',
    };
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Invalid form data.' };
    }
    return {
      success: false,
      message: 'Failed to submit feedback. Please try again.',
    };
  }
}
