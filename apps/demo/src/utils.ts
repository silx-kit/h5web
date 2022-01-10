import type { FeedbackContext } from '@h5web/app';
import { getFeedbackMailto } from '@h5web/app';

export function getFeedbackURL(context: FeedbackContext): string {
  const email = process.env.REACT_APP_FEEDBACK_EMAIL || '';
  return getFeedbackMailto(context, email);
}
