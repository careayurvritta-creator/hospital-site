import { describe, it, expect, vi } from 'vitest';
import { captureError, initErrorTracking } from '../../analytics/errorTracker';

describe('errorTracker', () => {
  it('should export initErrorTracking function', () => {
    expect(initErrorTracking).toBeDefined();
    expect(typeof initErrorTracking).toBe('function');
  });

  it('should export captureError function', () => {
    expect(captureError).toBeDefined();
    expect(typeof captureError).toBe('function');
  });

  it('should not throw when calling captureError', () => {
    expect(() => {
      captureError(new Error('Test error'), { severity: 'medium', source: 'test' });
    }).not.toThrow();
  });

  it('should handle non-Error objects', () => {
    expect(() => {
      captureError('string error', { severity: 'low', source: 'test' });
    }).not.toThrow();
  });

  it('should accept optional context parameters', () => {
    expect(() => {
      captureError(new Error('Test'), {
        severity: 'high',
        source: 'test',
        tags: { userId: '123' },
        extra: { key: 'value' },
      });
    }).not.toThrow();
  });
});