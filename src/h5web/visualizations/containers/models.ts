import { ReactElement } from 'react';
import type { HDF5Entity } from '../../providers/models';

export interface VisContainerProps {
  entity: HDF5Entity;
  entityName?: string;
}

export interface ToolbarProps {
  children?: ReactElement;
}
