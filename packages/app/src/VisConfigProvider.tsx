import { isDefined } from '@h5web/shared/guards';
import { type ReactNode } from 'react';

import { CORE_VIS } from './vis-packs/core/visualizations';
import { type VisDef } from './vis-packs/models';
import { NX_DATA_VIS } from './vis-packs/nexus/visualizations';

const coreProviders = Object.values<VisDef>(CORE_VIS)
  .map((vis) => vis.ConfigProvider)
  .filter(isDefined);

const nexusProviders = Object.values<VisDef>(NX_DATA_VIS)
  .map((vis) => vis.ConfigProvider)
  .filter(isDefined);

const allConfigProviders = new Set([...coreProviders, ...nexusProviders]);

interface Props {
  children: ReactNode;
}

function VisConfigProvider(props: Props) {
  const { children } = props;

  return [...allConfigProviders].reduce(
    (accChildren, NextProvider) => <NextProvider>{accChildren}</NextProvider>,
    children,
  );
}

export default VisConfigProvider;
