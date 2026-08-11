import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, render, act } from '@testing-library/react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
  constructor(cb: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
    this.callback = cb;
    MockIntersectionObserver.instances.push(this);
  }
  static instances: MockIntersectionObserver[] = [];
}

describe('useIntersectionObserver', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockIntersectionObserver.instances = [];
    window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return default values', () => {
    const { result } = renderHook(() => useIntersectionObserver({ threshold: 0.1 }));

    expect(result.current.isVisible).toBe(false);
    expect(result.current.hasBeenVisible).toBe(false);
    expect(result.current.ref).toBeDefined();
  });

  it('should update isVisible when intersecting', async () => {
    let currentIsVisible = false;

    const Harness = () => {
      const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
      currentIsVisible = isVisible;
      const refAny = ref as any;
      return <div ref={refAny} />;
    };

    render(<Harness />);
    expect(MockIntersectionObserver.instances.length).toBe(1);
    const observer = MockIntersectionObserver.instances[0];

    act(() => {
      observer.callback([{ isIntersecting: true } as IntersectionObserverEntry], observer as unknown as IntersectionObserver);
    });

    expect(currentIsVisible).toBe(true);
  });
});
