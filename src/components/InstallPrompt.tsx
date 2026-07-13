import { useState, useEffect } from 'react';

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<Event & { prompt: () => Promise<void> }>();

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as Event & { prompt: () => Promise<void> });
      setShow(true);
    }

    function onInstalled() {
      setShow(false);
    }

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="install-banner" role="dialog">
      <p>ຕິດຕັ້ງແອັບນີ້ໃສ່ໜ້າຈໍຫຼັກ</p>
      <div className="install-buttons">
        <button className="action-btn confirm" onClick={install}>
          Install
        </button>
        <button className="action-btn reject" onClick={() => setShow(false)}>
          ປິດ
        </button>
      </div>
    </div>
  );
}
