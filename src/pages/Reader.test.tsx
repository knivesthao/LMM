import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) =>
        Promise.resolve(resolve({ data: null, error: null }))
      ),
    }),
  },
}));

vi.mock('@/lib/idb', () => ({
  storeScene: vi.fn().mockResolvedValue(undefined),
  getScene: vi.fn().mockResolvedValue(null),
  isSceneDownloaded: vi.fn().mockResolvedValue(false),
  getDownloadedScenes: vi.fn().mockResolvedValue([]),
  removeContent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-1' },
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockManifest = {
  content_id: '1',
  title: 'The Brave Buffalo',
  total_scenes: 3,
  total_size_bytes: 1000000,
  scenes: [
    { number: 1, url: '/mock/content/1/scene_01.html', size_bytes: 300000 },
    { number: 2, url: '/mock/content/1/scene_02.html', size_bytes: 400000 },
    { number: 3, url: '/mock/content/1/scene_03.html', size_bytes: 300000 },
  ],
};

vi.stubGlobal(
  'fetch',
  vi.fn((url: string) => {
    if (typeof url === 'string' && url.includes('manifest.json')) {
      return Promise.resolve({
        json: () => Promise.resolve(mockManifest),
        text: () => Promise.resolve(JSON.stringify(mockManifest)),
      });
    }
    return Promise.resolve({
      text: () => Promise.resolve('<html><body>Scene</body></html>'),
    });
  })
);

import { Reader } from './Reader';

describe('Reader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderReader(id: string = '1') {
    return render(
      <MemoryRouter initialEntries={[`/read/${id}`]}>
        <Routes>
          <Route path="/read/:id" element={<Reader />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('shows scene counter after loading manifest', async () => {
    renderReader();
    await waitFor(() => {
      expect(screen.getByText('1 / 3')).toBeDefined();
    });
  });

  it('shows navigation buttons', async () => {
    renderReader();
    await waitFor(() => {
      expect(screen.getByText('← Prev')).toBeDefined();
      expect(screen.getByText('Next →')).toBeDefined();
    });
  });

  it('shows dot indicators for each scene', async () => {
    renderReader();
    await waitFor(() => {
      const dots = document.querySelectorAll('.dot');
      expect(dots.length).toBe(3);
    });
  });

  it('shows download all button when not all cached', async () => {
    renderReader();
    await waitFor(() => {
      expect(screen.getByText(/Download All/)).toBeDefined();
    });
  });

  it('prev button is disabled on first scene', async () => {
    renderReader();
    await waitFor(() => {
      const prevBtn = screen.getByText('← Prev');
      expect((prevBtn as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it('next button is enabled on first scene', async () => {
    renderReader();
    await waitFor(() => {
      const nextBtn = screen.getByText('Next →');
      expect((nextBtn as HTMLButtonElement).disabled).toBe(false);
    });
  });
});
