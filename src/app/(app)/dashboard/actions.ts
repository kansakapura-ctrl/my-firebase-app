'use server';

import { summarizeFeedback } from '@/ai/flows/summarize-feedback';
import { initializeFirebase } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';

type ActionResult = {
  success: boolean;
  message: string;
  data?: string;
};

export async function summarizeFeedbackAction(): Promise<ActionResult> {
  try {
    // 1. Fetch all feedback from Firestore
    const { firestore } = initializeFirebase();
    const feedbackSnapshot = await getDocs(collection(firestore, 'feedback'));
    const feedbackData = feedbackSnapshot.docs.map(doc => doc.data());

    if (feedbackData.length === 0) {
      return {
        success: true,
        message: 'No feedback to summarize.',
        data: 'There is no user feedback to analyze yet. Come back after some has been submitted!',
      };
    }

    // 2. Call the AI flow to summarize the feedback
    const summary = await summarizeFeedback({ feedback: feedbackData });

    return {
      success: true,
      message: 'Feedback summarized successfully.',
      data: summary,
    };
  } catch (error) {
    console.error('Error summarizing feedback:', error);
    return {
      success: false,
      message: 'Failed to summarize feedback. Please try again later.',
    };
  }
}
