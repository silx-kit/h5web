import {
  useClick,
  useInteractions,
  useListNavigation,
} from '@floating-ui/react';
import { type ExportEntry } from '@h5web/shared/vis-models';
import { useId, useRef, useState } from 'react';
import { FiDownload } from 'react-icons/fi';

import toolbarStyles from '../Toolbar.module.css';
import Btn from './Btn';
import { useFloatingDismiss, useFloatingMenu } from './hooks';
import { download } from './utils';

interface Props {
  entries: ExportEntry[];
  isSlice?: boolean;
}

function ExportMenu(props: Props) {
  const { entries, isSlice } = props;

  const { context, refs, floatingStyles } = useFloatingMenu();
  const { floatingId, open: isOpen, onOpenChange: toggle } = context;

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
        disabled={entries.length === 0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={(isOpen && floatingId) || undefined}
        {...getReferenceProps()}
      />

      {isOpen && (
        <div
          ref={refs.setFloating}
          id={floatingId}
          className={toolbarStyles.menu}
          style={floatingStyles}
          role="menu"
          aria-labelledby={referenceId}
          {...getFloatingProps()}
        >
          {entries.map((entry, index) => {
            const { format, url } = entry;
            const isActive = activeIndex === index;

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
