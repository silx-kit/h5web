import type { ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import AxisSystem from '../shared/AxisSystem';
import type { AxisOffsets, AxisConfig } from '../models';
import { computeSameRatioDomains } from '../utils';

interface Props {
  axisOffsets: AxisOffsets;
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  imageRatio?: number;
  title?: string;
  children: ReactNode;
}

function HeatmapAxisSystem(props: Props) {
  const { abscissaConfig, ordinateConfig, imageRatio, ...forwardProps } = props;

  const { width, height } = useThree((state) => state.size);

  if (!imageRatio) {
    return (
      <AxisSystem
        abscissaConfig={abscissaConfig}
        ordinateConfig={ordinateConfig}
        {...forwardProps}
      />
    );
  }

  const [xAxisDomain, yAxisDomain] = computeSameRatioDomains(
    width / height,
    imageRatio,
    abscissaConfig.domain,
    ordinateConfig.domain
  );

  return (
    <AxisSystem
      abscissaConfig={{ ...abscissaConfig, domain: xAxisDomain }}
      ordinateConfig={{ ...ordinateConfig, domain: yAxisDomain }}
      {...forwardProps}
    />
  );
}

export default HeatmapAxisSystem;
