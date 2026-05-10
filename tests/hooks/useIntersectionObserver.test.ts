import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

describe('useIntersectionObserver', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return default values', () => {
    const { result } = renderHook(() => useIntersectionObserver({ threshold: 0.1 }));
    
    expect(result.current.isVisible).toBe(false);
    expect(result.current.ref).toBeDefined();
  });

  it('should update isVisible when intersecting', async () => {
    const { result } = renderHook(() => useIntersectionObserver({ threshold: 0.1 }));
    
    // Simulate intersection
    act(() => {
      const callback = (result.current as any).observerCallback;
      callback([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    await waitFor(() => {
      expect(result.current.isVisible).toBe(true);
    });
  });
});