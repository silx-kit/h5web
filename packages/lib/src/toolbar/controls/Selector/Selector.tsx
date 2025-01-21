import {
  FloatingList,
  useClick,
  useInteractions,
  useListNavigation,
} from '@floating-ui/react';
import { type ReactNode, useId, useRef, useState } from 'react';
import { MdArrowDropDown } from 'react-icons/md';

import toolbarStyles from '../../Toolbar.module.css';
import { useFloatingDismiss, useFloatingMenu } from '../hooks';
import { getAllOptions } from '../utils';
import Option from './Option';
import styles from './Selector.module.css';

interface Props<T> {
  label?: string;
  value: T;
  disabled?: boolean;
  onChange: (value: T) => void;
  options: Record<string, T[]> | T[];
  renderOption: (option: T) => ReactNode;
}

function Selector<T extends string>(props: Props<T>) {
  const { label, value, disabled, onChange, options, renderOption } = props;

  const { context, refs, floatingStyles } = useFloatingMenu();
  const { open: isOpen, floatingId, onOpenChange: toggle } = context;

  const labelId = useId();
  const referenceId = useId();
  const currentOptionId = useId();
  const listRef = useRef<(HTMLButtonElement | null)[]>([]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(() => {
    return getAllOptions(options).indexOf(value);
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

  function handleSelect(index: number, option: T) {
    setSelectedIndex(index);
    toggle(false);
    onChange(option);
  }

  return (
    <>
      {label && (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      )}

      <button
        ref={refs.setReference}
        id={referenceId}
        className={toolbarStyles.btn}
        type="button"
        disabled={disabled}
        role="combobox"
        aria-labelledby={`${label ? labelId : ''} ${currentOptionId}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={(isOpen && floatingId) || undefined}
        {...getReferenceProps()}
      >
        <span id={currentOptionId} className={toolbarStyles.btnLike}>
          {renderOption(value)}
          <MdArrowDropDown className={toolbarStyles.arrowIcon} />
        </span>
      </button>

      {isOpen && (
        <div
          ref={refs.setFloating}
          id={floatingId}
          className={toolbarStyles.menu}
          style={floatingStyles}
          role="listbox"
          aria-labelledby={referenceId}
          {...getFloatingProps()}
        >
          <FloatingList elementsRef={listRef}>
            {Array.isArray(options) ? (
              options.map((option) => (
                <Option
                  key={option}
                  activeIndex={activeIndex}
                  selectedIndex={selectedIndex}
                  getItemProps={getItemProps}
                  onSelect={(index) => handleSelect(index, option)}
                >
                  {renderOption(option)}
                </Option>
              ))
            ) : (
              <ul className={styles.groups}>
                {Object.entries(options).map(([groupLabel, groupOptions]) => (
                  <li key={groupLabel}>
                    <span className={styles.groupLabel}>{groupLabel}</span>
                    {groupOptions.map((option) => (
                      <Option
                        key={option}
                        activeIndex={activeIndex}
                        selectedIndex={selectedIndex}
                        getItemProps={getItemProps}
                        onSelect={(index) => handleSelect(index, option)}
                      >
                        {renderOption(option)}
                      </Option>
                    ))}
                  </li>
                ))}
              </ul>
            )}
          </FloatingList>
        </div>
      )}
    </>
  );
}

export default Selector;
