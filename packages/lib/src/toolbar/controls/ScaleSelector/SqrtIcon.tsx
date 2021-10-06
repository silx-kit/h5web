/**
 * Inspired by FiActivity
 */
import type { SVGProps } from 'react';

function SqrtIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      height="1em"
      width="1em"
      {...props}
    >
      <polyline points="2 12 6 12 9 21 15 3 19 3" />
    </svg>
  );
}

export default SqrtIcon;
