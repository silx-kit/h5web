import {
  autoUpdate,
  offset,
  useClick,
  useFloating,
  useInteractions,
  useListNavigation,
} from '@floating-ui/react';
import { assertDefined } from '@h5web/shared/guards';
import { useToggle } from '@react-hookz/web';
import { useRef, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { MdArrowDropDown } from 'react-icons/md';

import { useFloatingDismiss } from './hooks';
import styles from './Selector/Selector.module.css';
import { download } from './utils';

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
  const listRef = useRef<(HTMLButtonElement | null)[]>([]);

  const { refs, floatingStyles, context } = useFloating<HTMLButtonElement>({
    open: isOpen,
    placement: PLACEMENTS[align],
    middleware: [offset(6)],
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
      <button
        ref={refs.setReference}
        className={styles.btn}
        type="button"
        disabled={availableEntries.length === 0}
        {...getReferenceProps()}
      >
        <span className={styles.btnLike}>
          <FiDownload className={styles.icon} />
          <span className={styles.label}>Export{isSlice && ' slice'}</span>
          <MdArrowDropDown className={styles.arrowIcon} />
        </span>
      </button>

      {isOpen && (
        <div
          ref={refs.setFloating}
          className={styles.exportMenu}
          style={floatingStyles}
          role="menu"
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
                className={styles.btnOption}
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
                <span className={styles.label}>
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
