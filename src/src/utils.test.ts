import { describe, it, expect } from 'vitest';
import { deepMerge } from './utils';

describe('deepMerge', () => {
  it('should merge two simple objects', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('should deeply merge nested objects', () => {
    const target = {
      colors: { primary: 'blue', secondary: 'green' },
      spacing: { sm: '8px' },
    };
    const source = {
      colors: { primary: 'red', tertiary: 'yellow' },
      spacing: { md: '16px' },
    };
    const result = deepMerge(target, source);

    expect(result).toEqual({
      colors: { primary: 'red', secondary: 'green', tertiary: 'yellow' },
      spacing: { sm: '8px', md: '16px' },
    });
  });

  it('should not mutate the original target object', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    const originalTarget = { ...target };

    deepMerge(target, source);

    expect(target).toEqual(originalTarget);
  });

  it('should handle empty source object', () => {
    const target = { a: 1, b: 2 };
    const source = {};
    const result = deepMerge(target, source);

    expect(result).toEqual(target);
  });

  it('should override non-object values', () => {
    const target = { a: 1, b: { c: 2 } };
    const source = { a: 5, b: { c: 10 } };
    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 5, b: { c: 10 } });
  });
});
