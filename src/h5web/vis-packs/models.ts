import type { ElementType } from 'react';
import type { IconType } from 'react-icons';
import type { Entity } from '../providers/models';

export interface VisContainerProps {
  entity: Entity;
}

export interface VisDef {
  name: string;
  Icon: IconType;
  Toolbar?: ElementType;
  Container: ElementType<VisContainerProps>;
}
