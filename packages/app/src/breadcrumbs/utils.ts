import type { FeedbackContext } from './models';

export function getFeedbackMailto(
  context: FeedbackContext,
  email: string,
  subject = 'Feedback'
): string {
  const { version, filePath, entityPath } = context;
  const body = `Hi,

<< Please provide your feedback here. >>
<< To report an issue, please include screenshots, reproduction steps, etc. >>
<< To suggest a new feature, please describe the needs this feature would fulfill. >>

Here is some additional context:

- User agent: ${navigator.userAgent}
- Location: ${window.location.href}
- File path: ${filePath}
- Entity path: ${entityPath}
- @h5web/app version: ${version}
- << Any other info (JupyterLab, etc.) >>

Thanks,
<< Name >>`;

  return `mailto:${email}?subject=${subject}&body=${encodeURIComponent(body)}`;
}
