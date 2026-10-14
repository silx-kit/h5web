import {
  useClick,
  useInteractions,
  useListNavigation,
} from '@floating-ui/react';
import { type ComponentType, useId, useRef, useState } from 'react';

import toolbarStyles from '../Toolbar.module.css';
import Btn from './Btn';
import { useFloatingDismiss, useFloatingMenu } from './hooks';

export interface Action {
  key: string;
  label: string;
  onSelect: (menuBtn: HTMLElement | null) => void; // receives the menu's button
}

interface Props {
  label: string;
  Icon: ComponentType<{ className: string }>;
  actions: Action[];
  disabled?: boolean;
}

/* Toolbar button that opens a menu of actions (e.g. export formats) */
function ActionMenu(props: Props) {
  const { label, Icon, actions, disabled } = props;

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
        label={label}
        Icon={Icon}
        withArrow
        disabled={disabled}
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
          {actions.map((action, index) => {
            const isActive = activeIndex === index;

            return (
              <button
                key={action.key}
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
                    action.onSelect(refs.domReference.current);
                  },
                })}
              >
                <span className={toolbarStyles.label}>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

export default ActionMenu;
