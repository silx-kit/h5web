import { isDefined } from '@h5web/shared';
import type { ReactNode } from 'react';

import { CORE_VIS } from './core/visualizations';
import { NEXUS_VIS } from './nexus/visualizations';

const coreProviders = Object.values(CORE_VIS)
  .map((vis) => vis.ConfigProvider)
  .filter(isDefined);

const nexusProviders = Object.values(NEXUS_VIS)
  .map((vis) => vis.ConfigProvider)
  .filter(isDefined);

const allConfigProviders = new Set([...coreProviders, ...nexusProviders]);

interface Props {
  children: ReactNode;
}

function VisConfigProvider(props: Props) {
  const { children } = props;

  return (
    <>
      {[...allConfigProviders].reduce(
        (accChildren, NextProvider) => (
          <NextProvider>{accChildren}</NextProvider>
        ),
        children
      )}
    </>
  );
}

export default VisConfigProvider;
