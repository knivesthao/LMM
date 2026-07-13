import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  storeScene,
  getScene,
  isSceneDownloaded,
  getDownloadedScenes,
} from '@/lib/idb';

interface SceneManifest {
  content_id: string;
  title: string;
  total_scenes: number;
  total_size_bytes: number;
  scenes: { number: number; url: string; size_bytes: number }[];
}

type DownloadState = 'pending' | 'downloading' | 'done' | 'cached';

export function Reader() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentScene, setCurrentScene] = useState(0);
  const [sceneHtml, setSceneHtml] = useState<string | null>(null);
  const [manifest, setManifest] = useState<SceneManifest | null>(null);
  const [sceneStates, setSceneStates] = useState<Map<number, DownloadState>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [progress, setProgress] = useState(0);

  // Load manifest
  useEffect(() => {
    async function load() {
      if (!id) return;

      if (import.meta.env.DEV) {
        // Dev: use mock manifest
        const response = await fetch(`/mock/content/1/manifest.json`);
        const mockManifest: SceneManifest = await response.json();
        setManifest(mockManifest);

        // Check what's cached
        const downloaded = await getDownloadedScenes(id);
        const states = new Map<number, DownloadState>();
        for (const n of downloaded) {
          states.set(n, 'cached');
        }
        setSceneStates(states);
      } else {
        // Production: fetch manifest from API
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          setLoading(false);
          return;
        }

        // Build manifest from project scenes
        // Workers would return this; for now construct from DB
      }

      setLoading(false);
    }
    load();
  }, [id]);

  // Load current scene from cache or network
  useEffect(() => {
    if (!manifest || !id) return;

    const scene = manifest.scenes[currentScene];
    if (!scene) return;

    const state = sceneStates.get(scene.number);

    if (state === 'cached') {
      // Load from IndexedDB
      getScene(id, scene.number).then((html) => setSceneHtml(html));
    } else if (state === 'done') {
      // Scene was fetched but not cached (rare)
      fetch(scene.url)
        .then((r) => r.text())
        .then((html) => setSceneHtml(html));
    } else {
      // Fetch from network, cache it
      setSceneHtml(null);
      setSceneStates((prev) => {
        const next = new Map(prev);
        next.set(scene.number, 'downloading');
        return next;
      });

      fetch(scene.url)
        .then((r) => r.text())
        .then((html) => {
          setSceneHtml(html);
          storeScene(id, scene.number, html, scene.url);
          setSceneStates((prev) => {
            const next = new Map(prev);
            next.set(scene.number, 'cached');
            return next;
          });
        })
        .catch(() => {
          setSceneStates((prev) => {
            const next = new Map(prev);
            next.set(scene.number, 'pending');
            return next;
          });
        });
    }
  }, [manifest, currentScene, id, sceneStates]);

  const goToScene = useCallback(
    (index: number) => {
      if (index >= 0 && index < (manifest?.total_scenes ?? 0)) {
        setCurrentScene(index);
      }
    },
    [manifest]
  );

  const downloadAll = useCallback(async () => {
    if (!manifest || !id) return;
    setDownloadingAll(true);
    setProgress(0);

    for (let i = 0; i < manifest.scenes.length; i++) {
      const scene = manifest.scenes[i];

      // Skip if already cached
      if (await isSceneDownloaded(id, scene.number)) {
        setProgress(((i + 1) / manifest.scenes.length) * 100);
        continue;
      }

      setProgress(((i + 0.5) / manifest.scenes.length) * 100);

      try {
        const response = await fetch(scene.url);
        const html = await response.text();
        await storeScene(id, scene.number, html, scene.url);
      } catch {
        // Skip failed downloads, try again later
      }

      setProgress(((i + 1) / manifest.scenes.length) * 100);
    }

    // Refresh cached states
    const downloaded = await getDownloadedScenes(id);
    const states = new Map<number, DownloadState>();
    for (const n of downloaded) {
      states.set(n, 'cached');
    }
    setSceneStates(states);
    setDownloadingAll(false);
  }, [manifest, id]);

  if (loading) {
    return (
      <div className="reader">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!manifest) {
    return (
      <div className="reader">
        <div className="empty"><p>Content not found.</p></div>
      </div>
    );
  }

  const cachedCount = [...sceneStates.values()].filter(
    (s) => s === 'cached'
  ).length;
  const allCached = cachedCount === manifest.total_scenes;

  return (
    <div className="reader">
      <div className="reader-toolbar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <span className="scene-counter">
          {currentScene + 1} / {manifest.total_scenes}
        </span>
        {!allCached && (
          <button
            className="download-all-btn"
            onClick={downloadAll}
            disabled={downloadingAll}
          >
            {downloadingAll
              ? `${Math.round(progress)}%`
              : `Download All (${manifest.total_scenes - cachedCount} left)`}
          </button>
        )}
        {allCached && <span className="cached-badge">✓ Offline</span>}
      </div>

      {downloadingAll && (
        <div className="download-bar">
          <div
            className="download-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div
        className="scene-viewport"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') goToScene(currentScene + 1);
          if (e.key === 'ArrowLeft') goToScene(currentScene - 1);
        }}
      >
        {sceneHtml ? (
          <iframe
            srcDoc={sceneHtml}
            title={`Scene ${currentScene + 1}`}
            className="scene-frame"
            sandbox="allow-same-origin"
          />
        ) : (
          <div className="loading">
            <div className="spinner" />
            <p>Loading scene...</p>
            <div className="scene-progress">
              <div
                className="scene-progress-fill"
                style={{ width: `${(cachedCount / manifest.total_scenes) * 100}%` }}
              />
            </div>
            <p className="hint">
              {cachedCount}/{manifest.total_scenes} scenes cached
            </p>
          </div>
        )}
      </div>

      <div className="reader-nav">
        <button
          onClick={() => goToScene(currentScene - 1)}
          disabled={currentScene === 0}
        >
          ← Prev
        </button>
        <div className="scene-dots">
          {manifest.scenes.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === currentScene ? 'active' : ''} ${
                sceneStates.get(i + 1) === 'cached' ? 'cached' : ''
              }`}
              onClick={() => goToScene(i)}
              aria-label={`Scene ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => goToScene(currentScene + 1)}
          disabled={currentScene === manifest.total_scenes - 1}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
