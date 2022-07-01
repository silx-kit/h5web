import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';

interface Props {
  value: number;
}

function ThresholdAdjuster(props: Props) {
  const { value } = props;
  const raycaster = useThree((state) => state.raycaster);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    const params = raycaster.params.Points;
    const oldThreshold = params ? params.threshold : 1;

    if (params) {
      params.threshold = value;
    }

    return () => {
      if (params) {
        params.threshold = oldThreshold;
      }
    };
  }, [raycaster, value]);

  useFrame(() => {
    // Points stay the same size on the screen when zooming
    // but as the threshold is in world units, it grows when zooming
    // So we adapt the threshold value to the zoom
    const zoom = (camera.scale.x + camera.scale.y) / 2;

    if (raycaster.params.Points) {
      raycaster.params.Points.threshold = (value * zoom) / 2;
    }
  });

  return null;
}

export default ThresholdAdjuster;
