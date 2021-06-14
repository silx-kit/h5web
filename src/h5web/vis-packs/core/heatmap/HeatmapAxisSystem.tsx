import type { ReactNode } from 'react';
import AxisSystem from '../shared/AxisSystem';
import type { AxisOffsets, AxisConfig } from '../models';
import { useImageSize, useCanvasDomains } from './hooks';

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

  const imageSize = useImageSize(imageRatio);

  const [xAxisDomain, yAxisDomain] = useCanvasDomains(
    imageSize,
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
