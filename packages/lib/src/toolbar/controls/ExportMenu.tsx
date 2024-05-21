import {
  autoUpdate,
  offset,
  shift,
  useClick,
  useFloating,
  useInteractions,
  useListNavigation,
} from '@floating-ui/react';
import { assertDefined } from '@h5web/shared/guards';
import { useToggle } from '@react-hookz/web';
import { useId, useRef, useState } from 'react';
import { FiDownload } from 'react-icons/fi';

import toolbarStyles from '../Toolbar.module.css';
import Btn from './Btn';
import { useFloatingDismiss } from './hooks';
import { download, floatingMinWidth } from './utils';

const PLACEMENTS = {
  center: 'bottom',
  left: 'bottom-start',
  right: 'bottom-end',
} as const;

interface ExportEntry {
  format: string;
  url: URL | (() => Promise<URL | Blob>) | undefined;
}

interface Props {
  entries: ExportEntry[];
  isSlice?: boolean;
  align?: keyof typeof PLACEMENTS;
}

function ExportMenu(props: Props) {
  const { entries, isSlice, align = 'center' } = props;
  const availableEntries = entries.filter(({ url }) => !!url);

  const [isOpen, toggle] = useToggle();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const referenceId = useId();
  const listRef = useRef<(HTMLButtonElement | null)[]>([]);

  const { refs, floatingStyles, context } = useFloating<HTMLButtonElement>({
    open: isOpen,
    placement: PLACEMENTS[align],
    middleware: [floatingMinWidth, offset(6), shift({ padding: 6 })],
    onOpenChange: toggle,
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [
      useClick(context),
      useFloatingDismiss(context),
      useListNavigation(context, {
        listRef,
        activeIndex,
        loop: true,
        focusItemOnHover: false,
        onNavigate: setActiveIndex,
      }),
    ],
  );

  return (
    <>
      <Btn
        ref={refs.setReference}
        id={referenceId}
        label={`Export${isSlice ? ' slice' : ''}`}
        icon={FiDownload}
        withArrow
        disabled={availableEntries.length === 0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={(isOpen && context.floatingId) || undefined}
        {...getReferenceProps()}
      />

      {isOpen && (
        <div
          ref={refs.setFloating}
          id={context.floatingId}
          className={toolbarStyles.menu}
          style={floatingStyles}
          role="menu"
          aria-labelledby={referenceId}
          {...getFloatingProps()}
        >
          {availableEntries.map((entry, index) => {
            const { format, url } = entry;
            const isActive = activeIndex === index;
            assertDefined(url);

            return (
              <button
                key={format}
                ref={(node) => {
                  listRef.current[index] = node;
                }}
                className={toolbarStyles.btnOption}
                type="button"
                tabIndex={isActive ? 0 : -1}
                data-active={isActive || undefined}
                {...getItemProps({
                  onClick: () => {
                    toggle(false);
                    void download(url, `data.${format}`);
                  },
                })}
              >
                <span className={toolbarStyles.label}>
                  Export to {format.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

export default ExportMenu;
