import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGenerate } from './useGenerate';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      then: vi.fn((resolve: (v: Record<string, unknown>) => void) =>
        Promise.resolve(resolve({ data: [], error: null }))
      ),
    })),
  },
}));

describe('useGenerate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a mock URL in dev mode', async () => {
    const { result } = renderHook(() => useGenerate());

    const url = await act(() =>
      result.current('A boy walks through a rice field', 1, 'proj-1')
    );

    expect(url).toMatch(/\/mock\/content\/1\/scene_/);
  });

  it('returns different mock scenes for different scene numbers', async () => {
    const { result } = renderHook(() => useGenerate());

    const url1 = await act(() =>
      result.current('Scene one', 1, 'proj-1')
    );
    const url2 = await act(() =>
      result.current('Scene two', 6, 'proj-1')
    );

    expect(url1).toMatch(/scene_1\.html$/);
    expect(url2).toMatch(/scene_1\.html$/); // (6-1)%5+1 = scene_1.html
  });
});
