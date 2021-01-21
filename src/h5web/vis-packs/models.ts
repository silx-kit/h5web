import type { ElementType } from 'react';
import type { IconType } from 'react-icons';
import type { Entity } from '../providers/models';
import type { ToolbarProps } from '../toolbar/Toolbar';

export interface VisContainerProps {
  entity: Entity;
}

export interface VisDef {
  name: string;
  Icon: IconType;
  Toolbar?: ElementType<ToolbarProps>;
  Container: ElementType<VisContainerProps>;
}
