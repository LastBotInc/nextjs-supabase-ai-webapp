import type { jest } from '@jest/globals';

declare global {
  const jest: typeof jest;
  namespace jest {
    interface Matchers<R> {
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toHaveBeenCalledWith(...args: any[]): R;
    }
  }
} 