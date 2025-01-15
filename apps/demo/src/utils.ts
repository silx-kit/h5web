import { type FeedbackContext, getFeedbackMailto } from '@h5web/app';

export function getFeedbackURL(context: FeedbackContext): string {
  const email = import.meta.env.VITE_FEEDBACK_EMAIL as string;
  return getFeedbackMailto(context, email);
}
