import type { DType, Entity, Primitive } from '@h5web/shared';
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

export type ValueFormatter<T extends DType> = (val: Primitive<T>) => string;
