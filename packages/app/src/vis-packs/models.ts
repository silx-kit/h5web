import type { Entity } from '@h5web/shared';
import type { ElementType, ReactNode } from 'react';
import type { IconType } from 'react-icons';

export interface VisContainerProps {
  entity: Entity;
  toolbarContainer: HTMLDivElement | undefined;
}

export interface ConfigProviderProps {
  children: ReactNode;
}

export interface VisDef {
  name: string;
  Icon: IconType;
  Container: ElementType<VisContainerProps>;
  ConfigProvider?: ElementType<ConfigProviderProps>;
}
