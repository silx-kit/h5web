import type { Entity } from '@h5web/shared';
import type { ElementType, ReactNode } from 'react';
import type { IconType } from 'react-icons';

export interface VisContainerProps {
  entity: Entity;
}

export interface ConfigProviderProps {
  children: ReactNode;
}

export interface VisDef {
  name: string;
  Icon: IconType;
  Toolbar?: ElementType;
  Container: ElementType<VisContainerProps>;
  ConfigProvider?: ElementType<ConfigProviderProps>;
}
