import type { ReactNode } from 'react';
import { isDefined } from './guards';
import { CORE_VIS } from './vis-packs/core/visualizations';
import { NEXUS_VIS } from './vis-packs/nexus/visualizations';

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
