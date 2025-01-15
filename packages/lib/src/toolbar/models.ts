import type { ReactElement } from 'react';

export interface ReactElementWithKey extends ReactElement {
  key: string;
}
