import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

let mockProjects: Record<string, unknown>[] = [];

function makeBuilder(data: unknown = null) {
  const b: Record<string, ReturnType<typeof vi.fn>> = {};
  b.select = vi.fn(() => b);
  b.eq = vi.fn(() => b);
  b.insert = vi.fn(() => b);
  b.order = vi.fn(() => b);
  b.update = vi.fn(() => b);
  b.single = vi.fn(() => b);
  b.then = vi.fn((resolve: (v: Record<string, unknown>) => void) =>
    Promise.resolve(resolve({ data, error: null }))
  );
  return b;
}

let builder = makeBuilder();

vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn(() => builder), rpc: vi.fn() },
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'creator-1' }, loading: false, signIn: vi.fn(), signOut: vi.fn(),
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { StudioDashboard } from './Studio';

describe('StudioDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProjects = [];
    builder = makeBuilder(mockProjects);
  });

  function renderDashboard() {
    return render(
      <MemoryRouter><StudioDashboard /></MemoryRouter>
    );
  }

  it('shows the creator studio header', async () => {
    renderDashboard();
    await waitFor(() => { expect(screen.getByText('Creator Studio')).toBeDefined(); });
  });

  it('shows new project buttons', async () => {
    renderDashboard();
    await waitFor(() => { expect(screen.getByText('+ New Comic')).toBeDefined(); });
  });

  it('shows empty state when no projects', async () => {
    renderDashboard();
    await waitFor(() => { expect(screen.getByText('No projects yet.')).toBeDefined(); });
  });

  it('shows project list when projects exist', async () => {
    mockProjects = [{ id: '1', title: 'My Comic', type: 'comic', language: 'lao', status: 'draft' }];
    builder = makeBuilder(mockProjects);
    renderDashboard();
    await waitFor(() => { expect(screen.getByText('My Comic')).toBeDefined(); });
  });
});
