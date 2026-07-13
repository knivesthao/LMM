import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRetry } from './useRetry';

describe('useRetry', () => {
  it('returns the result on first success', async () => {
    const { result } = renderHook(() => useRetry());
    const fn = vi.fn().mockResolvedValue('ok');

    await act(async () => {
      const val = await result.current(fn);
      expect(val).toBe('ok');
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and returns on success', async () => {
    const { result } = renderHook(() => useRetry({ baseDelay: 10 }));
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');

    await act(async () => {
      const val = await result.current(fn);
      expect(val).toBe('ok');
    });

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws after exhausting retries', async () => {
    const { result } = renderHook(() =>
      useRetry({ maxRetries: 2, baseDelay: 10 })
    );
    const fn = vi.fn().mockRejectedValue(new Error('fail'));

    await act(async () => {
      await expect(result.current(fn)).rejects.toThrow('fail');
    });

    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('uses custom maxRetries', async () => {
    const { result } = renderHook(() =>
      useRetry({ maxRetries: 1, baseDelay: 10 })
    );
    const fn = vi.fn().mockRejectedValue(new Error('fail'));

    await act(async () => {
      await expect(result.current(fn)).rejects.toThrow('fail');
    });

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('returns immediately on first success', async () => {
    const { result } = renderHook(() => useRetry());
    const start = Date.now();
    const fn = vi.fn().mockResolvedValue('fast');

    await act(async () => {
      await result.current(fn);
    });

    expect(Date.now() - start).toBeLessThan(500);
  });
});
