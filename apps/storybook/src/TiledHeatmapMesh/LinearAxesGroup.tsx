import { useVisCanvasContext } from '@h5web/lib';
import { type NoProps } from '@h5web/shared/vis-models';
import { type PropsWithChildren } from 'react';

function LinearAxesGroup(props: PropsWithChildren<NoProps>) {
  const { children } = props;
  const { abscissaConfig, ordinateConfig, visSize } = useVisCanvasContext();
  const { width, height } = visSize;
  const sx =
    ((abscissaConfig.flip ? -1 : 1) * width) /
    (abscissaConfig.visDomain[1] - abscissaConfig.visDomain[0]);
  const sy =
    ((ordinateConfig.flip ? -1 : 1) * height) /
    (ordinateConfig.visDomain[1] - ordinateConfig.visDomain[0]);
  const x = 0.5 * (abscissaConfig.visDomain[0] + abscissaConfig.visDomain[1]);
  const y = 0.5 * (ordinateConfig.visDomain[0] + ordinateConfig.visDomain[1]);

  return (
    <group position={[-x * sx, -y * sy, 0]} scale={[sx, sy, 1]}>
      {children}
    </group>
  );
}

export default LinearAxesGroup;
