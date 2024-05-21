import {
  autoUpdate,
  FloatingList,
  offset,
  shift,
  size,
  useClick,
  useFloating,
  useInteractions,
  useListNavigation,
} from '@floating-ui/react';
import { useToggle } from '@react-hookz/web';
import { useId, useRef, useState } from 'react';
import { MdArrowDropDown } from 'react-icons/md';

import { useFloatingDismiss } from '../hooks';
import { getAllOptions } from '../utils';
import type { OptionComponent } from './models';
import Option from './Option';
import styles from './Selector.module.css';

const MENU_MAX_HEIGHT = 320; // 20rem

interface Props<T> {
  label?: string;
  value: T;
  disabled?: boolean;
  onChange: (value: T) => void;
  options: Record<string, T[]> | T[];
  optionComponent: OptionComponent<T>;
}

function Selector<T extends string>(props: Props<T>) {
  const {
    label,
    value,
    disabled,
    onChange,
    options,
    optionComponent: OptionComp,
  } = props;

  const [isOpen, toggle] = useToggle();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(() => {
    return getAllOptions(options).indexOf(value);
  });

  const labelId = useId();
  const referenceId = useId();
  const selectedOptionId = useId();
  const listRef = useRef<(HTMLButtonElement | null)[]>([]);

  const { refs, floatingStyles, context } = useFloating<HTMLButtonElement>({
    open: isOpen,
    middleware: [
      offset(6),
      size({
        padding: 12,
        apply({ availableHeight, elements, rects }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.min(availableHeight, MENU_MAX_HEIGHT)}px`,
            minWidth: `${rects.reference.width}px`,
          });
        },
      }),
      shift({ padding: 6 }),
    ],
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

  function handleSelect(index: number, option: T) {
    setSelectedIndex(index);
    toggle(false);
    onChange(option);
  }

  return (
    <div className={styles.root}>
      {label && (
        <span id={labelId} className={styles.selectorLabel}>
          {label}
        </span>
      )}

      <button
        ref={refs.setReference}
        id={referenceId}
        className={styles.btn}
        type="button"
        disabled={disabled}
        role="combobox"
        aria-labelledby={`${label ? labelId : ''} ${selectedOptionId}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen || undefined}
        aria-controls={context.floatingId}
        {...getReferenceProps()}
      >
        <span className={styles.btnLike}>
          <span id={selectedOptionId} className={styles.selectedOption}>
            <OptionComp option={value} isSelected />
          </span>
          <MdArrowDropDown className={styles.arrowIcon} />
        </span>
      </button>

      {isOpen && (
        <div
          ref={refs.setFloating}
          id={context.floatingId}
          className={styles.menu}
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
                  <OptionComp option={option} />
                </Option>
              ))
            ) : (
              <ul className={styles.list}>
                {Object.entries(options).map(([groupLabel, groupOptions]) => (
                  <li key={groupLabel}>
                    <span className={styles.groupLabel}>{groupLabel}</span>
                    <ul className={styles.list}>
                      {groupOptions.map((option) => (
                        <Option
                          key={option}
                          activeIndex={activeIndex}
                          selectedIndex={selectedIndex}
                          getItemProps={getItemProps}
                          onSelect={(index) => handleSelect(index, option)}
                        >
                          <OptionComp option={option} />
                        </Option>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </FloatingList>
        </div>
      )}
    </div>
  );
}

export default Selector;
