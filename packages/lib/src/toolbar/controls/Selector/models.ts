import { type ReactElement } from 'react';

export type OptionComponent<T> = (props: {
  option: T;
  isSelected?: boolean;
}) => ReactElement;
