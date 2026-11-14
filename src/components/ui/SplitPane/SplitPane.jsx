import { useRef, useState } from 'react';
import { useMediaQuery } from '../../../hooks/useMediaQuery.js';
import './SplitPane.css';

function clampSize(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function SplitPane({
  primary,
  secondary,
  label,
  initialSize = 50,
  minSize = 20,
  maxSize = 80,
  onResize,
  className = '',
}) {
  if (
    !Number.isFinite(minSize) ||
    !Number.isFinite(maxSize) ||
    minSize < 0 ||
    maxSize > 100 ||
    minSize >= maxSize
  ) {
    throw new RangeError('SplitPane size limits must satisfy 0 <= minSize < maxSize <= 100.');
  }
  if (!Number.isFinite(initialSize)) {
    throw new RangeError('SplitPane initialSize must be a finite number.');
  }

  const isMobile = useMediaQuery('(max-width: 47.99rem)');
  const initialValue = clampSize(initialSize, minSize, maxSize);
  const [size, setSize] = useState(initialValue);
  const [resizing, setResizing] = useState(false);
  const containerRef = useRef(null);
  const sizeRef = useRef(size);
  const pointerActive = useRef(false);

  function applySize(nextSize, notify = false) {
    const clampedSize = clampSize(nextSize, minSize, maxSize);
    sizeRef.current = clampedSize;
    containerRef.current?.style.setProperty('--ui-split-size', `${clampedSize}%`);
    setSize(clampedSize);
    if (notify) onResize?.(clampedSize);
  }

  function handlePointerDown(event) {
    if (isMobile || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerActive.current = true;
    setResizing(true);
  }

  function handlePointerMove(event) {
    if (!pointerActive.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const isRtl = getComputedStyle(containerRef.current).direction === 'rtl';
    const offset = isRtl ? rect.right - event.clientX : event.clientX - rect.left;
    applySize((offset / rect.width) * 100);
  }

  function handlePointerEnd() {
    if (!pointerActive.current) return;
    pointerActive.current = false;
    setResizing(false);
    onResize?.(sizeRef.current);
  }

  function handleKeyDown(event) {
    if (isMobile) return;
    const isRtl = getComputedStyle(containerRef.current).direction === 'rtl';
    const increaseKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
    const decreaseKey = isRtl ? 'ArrowRight' : 'ArrowLeft';
    if (event.key === increaseKey) {
      event.preventDefault();
      applySize(size + 5, true);
    } else if (event.key === decreaseKey) {
      event.preventDefault();
      applySize(size - 5, true);
    } else if (event.key === 'Home') {
      event.preventDefault();
      applySize(minSize, true);
    } else if (event.key === 'End') {
      event.preventDefault();
      applySize(maxSize, true);
    }
  }

  return (
    <div
      ref={containerRef}
      className={`ui-split-pane${resizing ? ' is-resizing' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--ui-split-size': `${size}%` }}
    >
      <div className="ui-split-pane__primary">{primary}</div>
      <div
        className="ui-split-pane__separator"
        role="separator"
        aria-label={label}
        aria-orientation={isMobile ? 'horizontal' : 'vertical'}
        aria-valuemin={minSize}
        aria-valuemax={maxSize}
        aria-valuenow={Math.round(size)}
        aria-disabled={isMobile}
        tabIndex={isMobile ? -1 : 0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onLostPointerCapture={handlePointerEnd}
        onKeyDown={handleKeyDown}
      />
      <div className="ui-split-pane__secondary">{secondary}</div>
    </div>
  );
}
