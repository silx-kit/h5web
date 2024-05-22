import {
  useClick,
  useInteractions,
  useListNavigation,
} from '@floating-ui/react';
import { assertDefined } from '@h5web/shared/guards';
import { useId, useRef, useState } from 'react';
import { FiDownload } from 'react-icons/fi';

import toolbarStyles from '../Toolbar.module.css';
import Btn from './Btn';
import { useFloatingDismiss, useFloatingMenu } from './hooks';
import { download } from './utils';

interface ExportEntry {
  format: string;
  url: URL | (() => Promise<URL | Blob>) | undefined;
}

interface Props {
  entries: ExportEntry[];
  isSlice?: boolean;
}

function ExportMenu(props: Props) {
  const { entries, isSlice } = props;
  const availableEntries = entries.filter(({ url }) => !!url);

  const { context, refs, floatingStyles } = useFloatingMenu();
  const { open: isOpen, onOpenChange: toggle } = context;

  const referenceId = useId();
  const listRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
