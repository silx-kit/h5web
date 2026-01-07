import { type ProvidedEntity } from '@h5web/shared/hdf5-models';
import { type NoProps } from '@h5web/shared/vis-models';
import { type ElementType, type PropsWithChildren } from 'react';
import { type IconType } from 'react-icons';

export interface VisContainerProps {
  entity: ProvidedEntity;
  toolbarContainer: HTMLDivElement | undefined;
}

export interface VisDef {
  name: string;
  Icon: IconType;
  Container: ElementType<VisContainerProps>;
  ConfigProvider?: ElementType<PropsWithChildren<NoProps>>;
}
