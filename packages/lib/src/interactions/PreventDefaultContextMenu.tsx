import { useEventListener } from '@react-hookz/web';
import { useThree } from '@react-three/fiber';

import { useInteractionsContext } from './InteractionsProvider';
import { MouseButton } from './models';

interface Props {
  when?: 'as-needed' | 'always' | 'never';
}

function PreventDefaultContextMenu(props: Props) {
  const { when = 'as-needed' } = props;
  const { getInteractions } = useInteractionsContext();

  const { domElement } = useThree((state) => state.gl);

  useEventListener(domElement, 'contextmenu', (evt: PointerEvent) => {
    if (
      when === 'always' ||
      (when === 'as-needed' && getInteractions(MouseButton.Right).length > 0)
    ) {
      evt.preventDefault();
    }
  });

  return null;
}

export { type Props as PreventDefaultContextMenuProps };
export default PreventDefaultContextMenu;
