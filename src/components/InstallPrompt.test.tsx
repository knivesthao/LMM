import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { InstallPrompt } from './InstallPrompt';

describe('InstallPrompt', () => {
  let promptHandler: ((e: Event) => void) | null = null;
  let installedHandler: (() => void) | null = null;

  beforeEach(() => {
    promptHandler = null;
    installedHandler = null;
    vi.restoreAllMocks();

    vi.spyOn(window, 'addEventListener').mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (event: string, handler: any) => {
        const fn = typeof handler === 'function' ? handler : handler.handleEvent;
        if (event === 'beforeinstallprompt') promptHandler = fn as (e: Event) => void;
        if (event === 'appinstalled') installedHandler = fn as () => void;
      }
    );
    vi.spyOn(window, 'removeEventListener').mockImplementation(() => {});
  });

  function renderPrompt() {
    return render(<InstallPrompt />);
  }

  function firePrompt(): Event & { prompt: ReturnType<typeof vi.fn> } {
    const event = Object.assign(new Event('beforeinstallprompt'), {
      prompt: vi.fn().mockResolvedValue(undefined),
      preventDefault: vi.fn(),
    });
    act(() => {
      if (promptHandler) promptHandler(event);
    });
    return event;
  }

  it('is hidden by default', () => {
    renderPrompt();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows after beforeinstallprompt event', () => {
    renderPrompt();
    firePrompt();
    expect(screen.getByRole('dialog')).toBeDefined();
  });

  it('hides when user clicks dismiss', () => {
    renderPrompt();
    firePrompt();
    fireEvent.click(screen.getByText('ປິດ'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('calls prompt and hides on install click', async () => {
    renderPrompt();
    const event = firePrompt();
    fireEvent.click(screen.getByText('Install'));
    // Wait for the async prompt() to resolve and state to update
    await act(() => Promise.resolve());
    expect(event.prompt).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('hides on appinstalled event', () => {
    renderPrompt();
    firePrompt();
    act(() => {
      if (installedHandler) installedHandler();
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderPrompt();
    unmount();
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function)
    );
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'appinstalled',
      expect.any(Function)
    );
  });
});
