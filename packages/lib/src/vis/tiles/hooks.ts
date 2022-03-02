import { useThree } from '@react-three/fiber';

import { useVisibleDomains } from '../hooks';

export function useDataPerPixel() {
  const { xVisibleDomain, yVisibleDomain } = useVisibleDomains();
  const { width, height } = useThree((state) => state.size);

  return {
    xDataPerPixel: (xVisibleDomain[1] - xVisibleDomain[0]) / width,
    yDataPerPixel: (yVisibleDomain[1] - yVisibleDomain[0]) / height,
  };
}
