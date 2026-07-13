import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

let mockPaymentData: Record<string, unknown>[] = [];
let mockContentTitle = '';
const mockConfirm = vi.fn();
const mockReject = vi.fn();
function makeBuilder() {
  let count = 0;
  const b: Record<string, ReturnType<typeof vi.fn>> = {};
  b.select = vi.fn(() => b);
  b.eq = vi.fn(() => b);
  b.order = vi.fn(() => b);
  b.single = vi.fn(() => b);
  b.then = vi.fn((resolve: (v: Record<string, unknown>) => void) => {
    count++;
    if (count === 1) {
      return Promise.resolve(
        resolve({ data: mockPaymentData, error: null })
      );
    }
    return Promise.resolve(
      resolve({ data: { title: mockContentTitle || 'Test Book' }, error: null })
    );
  });
  return b;
}

let builder: ReturnType<typeof makeBuilder>;

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => builder),
    rpc: vi.fn((fn: string) => {
      if (fn === 'confirm_payment') return mockConfirm();
      if (fn === 'reject_payment') return mockReject();
      return Promise.resolve();
    }),
    auth: {
      admin: {
        getUserById: vi.fn(() =>
          Promise.resolve({
            data: { user: { phone: '+8562055550000' } },
          })
        ),
      },
    },
  },
}));

import { Admin } from './Admin';

describe('Admin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPaymentData = [
      {
        id: 'pay-1',
        user_id: 'user-1',
        content_id: 'content-1',
        amount_kip: 5000,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    ];
    mockContentTitle = 'The Brave Buffalo';
    builder = makeBuilder();
    mockConfirm.mockResolvedValue({});
    mockReject.mockResolvedValue({});
  });

  function renderAdmin() {
    return render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );
  }

  it('shows admin header', async () => {
    renderAdmin();
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeDefined();
    });
  });

  it('shows pending count badge', async () => {
    renderAdmin();
    await waitFor(() => {
      expect(screen.getByText('1 pending')).toBeDefined();
    });
  });

  it('shows payment row with amount', async () => {
    renderAdmin();
    await waitFor(() => {
      expect(screen.getByText('5,000 kip')).toBeDefined();
    });
  });

  it('shows confirm and reject buttons for pending payments', async () => {
    renderAdmin();
    await waitFor(() => {
      expect(screen.getByText('✓')).toBeDefined();
      expect(screen.getByText('✗')).toBeDefined();
    });
  });

  it('shows empty state when no payments', async () => {
    mockPaymentData = [];
    builder = makeBuilder();
    renderAdmin();
    await waitFor(() => {
      expect(screen.getByText('No payments found.')).toBeDefined();
    });
  });
});
