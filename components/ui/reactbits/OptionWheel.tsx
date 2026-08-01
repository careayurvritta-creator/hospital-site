import React, { useEffect, useRef, useState, useCallback } from 'react';

interface OptionWheelProps {
  items: string[];
  onChange?: (index: number, item: string) => void;
  defaultSelected?: number;
  className?: string;
  itemClassName?: string;
  rowHeight?: number;
  ariaLabel?: string;
}

const OptionWheel: React.FC<OptionWheelProps> = ({
  items,
  onChange,
  defaultSelected = 0,
  className = '',
  itemClassName = '',
  rowHeight = 56,
  ariaLabel = 'Option wheel',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(Math.min(defaultSelected, Math.max(items.length - 1, 0)));
  const selectedRef = useRef(selected);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    selectedRef.current = selected;
    onChangeRef.current?.(selected, items[selected]);
  }, [selected, items]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const clamped = Math.min(Math.max(index, 0), Math.max(items.length - 1, 0));
      const top = clamped * rowHeight + rowHeight / 2 - el.clientHeight / 2;
      el.scrollTo({ top, behavior: 'smooth' });
      setSelected(clamped);
    },
    [items.length, rowHeight]
  );

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const center = el.scrollTop + el.clientHeight / 2;
    const index = Math.min(
      Math.max(Math.round((center - rowHeight / 2) / rowHeight), 0),
      Math.max(items.length - 1, 0)
    );
    if (index !== selectedRef.current) {
      selectedRef.current = index;
      setSelected(index);
    }
  }, [items.length, rowHeight]);

  return (
    <div className={`reactbits-wheel ${className}`} style={{ height: rowHeight * 3 }}>
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide touch-pan-y"
        role="listbox"
        aria-label={ariaLabel}
        onScroll={handleScroll}
        tabIndex={0}
      >
        <div style={{ height: rowHeight * 3, paddingTop: rowHeight, paddingBottom: rowHeight }}>
          {items.map((item, index) => {
            const active = selected === index;
            return (
              <button
                key={`${item}-${index}`}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => scrollToIndex(index)}
                className={`reactbits-wheel-option snap-center flex items-center justify-center w-full text-left ${active ? 'active' : ''} ${itemClassName}`}
                style={{ height: rowHeight, minHeight: rowHeight }}
              >
                <span
                  className={`block truncate transition-colors duration-300 ${
                    active ? 'font-semibold text-ayur-green' : 'text-ayur-text/60'
                  }`}
                >
                  {item}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="reactbits-wheel-mask" aria-hidden="true" />
    </div>
  );
};

export default OptionWheel;
