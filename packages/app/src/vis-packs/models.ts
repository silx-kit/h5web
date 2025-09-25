import { type ProvidedEntity } from '@h5web/shared/hdf5-models';
import { type ElementType, type ReactNode } from 'react';
import { type IconType } from 'react-icons';

import { type AttrValuesStore } from '../providers/models';

export interface VisContainerProps {
  entity: ProvidedEntity;
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
  isPrimary?: (
    entity: ProvidedEntity,
    attrValuesStore: AttrValuesStore,
  ) => boolean;
}
