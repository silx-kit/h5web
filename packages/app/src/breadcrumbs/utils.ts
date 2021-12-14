import { version } from '../../package.json';

export function prepareFeedback(filepath: string, entityPath: string): string {
  return `Hi,

<< Please provide your feedback here. >>
<< To report an issue, please include screenshots, reproduction steps, etc. >>
<< To suggest a new feature, please describe the needs this feature would fulfill. >>

Here is some additional context:

- User agent: ${navigator.userAgent}
- Location: ${window.location.href}
- File path: ${filepath}
- Entity path: ${entityPath}
- @h5web/app version: ${version}
- << Any other info (JupyterLab, etc.) >>

Thanks,
<< Name >>`;
}
