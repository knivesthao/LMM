import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Project {
  id: string;
  creator_id: string;
  type: 'comic' | 'book';
  title: string;
  description: string;
  language: 'lao' | 'english';
  reading_level: string;
  price_kip: number;
  status: string;
}

interface Scene {
  id: string;
  project_id: string;
  scene_number: number;
  narration_text: string;
  rendered_image_url: string | null;
}

export function StudioDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from('projects')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setProjects(data || []); setLoading(false); });
  }, [user]);

  const createProject = useCallback(async (type: 'comic' | 'book') => {
    if (!user) return;
    const { data } = await supabase
      .from('projects')
      .insert({
        creator_id: user.id, type, title: 'Untitled',
        description: '', language: 'lao', reading_level: 'beginner',
        price_kip: 5000, status: 'draft',
      })
      .select().single();
    if (data) navigate(`/studio/${type}/${data.id}`);
  }, [user, navigate]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <div className="empty"><p>Log in to create content.</p></div>;

  return (
    <div className="studio">
      <header className="library-header">
        <h1>Creator Studio</h1>
        <Link to="/">← Library</Link>
      </header>
      <div className="studio-actions">
        <button className="buy-btn" onClick={() => createProject('comic')}>+ New Comic</button>
        <button className="buy-btn" onClick={() => createProject('book')}>+ New Book</button>
      </div>
      {projects.length === 0 ? (
        <div className="empty"><p>No projects yet.</p></div>
      ) : (
        <div className="content-grid">
          {projects.map((p) => (
            <Link to={`/studio/${p.type}/${p.id}`} key={p.id} className="content-card">
              <div className="card-body">
                <h2>{p.title}</h2>
                <span className="badge">{p.type}</span>
                <span className="badge">{p.language}</span>
                <span className="badge">{p.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function StudioEditor() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('scenes').select('*').eq('project_id', id).order('scene_number'),
    ]).then(([p, s]) => { setProject(p.data); setScenes(s.data || []); setLoading(false); });
  }, [id]);

  async function addScene() {
    if (!id) return;
    const next = scenes.length + 1;
    const { data } = await supabase
      .from('scenes').insert({ project_id: id, scene_number: next, narration_text: '' })
      .select().single();
    if (data) setScenes([...scenes, data]);
  }

  async function updateScene(sceneId: string, text: string) {
    setScenes(scenes.map((s) => (s.id === sceneId ? { ...s, narration_text: text } : s)));
  }

  async function saveScene(sceneId: string, text: string) {
    await supabase.from('scenes').update({ narration_text: text }).eq('id', sceneId);
    setSaving(true);
    setTimeout(() => setSaving(false), 800);
  }

  // Stub: simulate generation, return a mock image
  async function generateScene(scene: Scene) {
    if (!scene.narration_text.trim()) return;
    setGeneratingId(scene.id);
    await new Promise((r) => setTimeout(r, 2000));

    const mockUrl = `/mock/content/1/scene_${((scene.scene_number - 1) % 5) + 1}.html`;
    await supabase.from('scenes').update({ rendered_image_url: mockUrl }).eq('id', scene.id);
    setScenes(scenes.map((s) =>
      s.id === scene.id ? { ...s, rendered_image_url: mockUrl } : s
    ));
    setGeneratingId(null);
  }

  async function updateProject(fields: Partial<Project>) {
    if (!id || !project) return;
    setProject({ ...project, ...fields });
    await supabase.from('projects').update(fields).eq('id', id);
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (!project) return <div className="empty"><p>Project not found.</p></div>;

  const isBook = type === 'book';

  return (
    <div className="studio-editor">
      <div className="editor-toolbar">
        <button className="back-btn" onClick={() => navigate('/studio')}>← Studio</button>
        <input
          className="title-input"
          value={project.title}
          onChange={(e) => setProject({ ...project, title: e.target.value })}
          onBlur={() => updateProject({ title: project.title })}
        />
        {saving && <span className="saving-indicator">Saved</span>}
      </div>

      <div className="scene-list">
        {scenes.map((scene, i) => (
          <div key={scene.id} className="scene-card">
            <div className="scene-number">{i + 1}</div>
            <div className="scene-body">
              <textarea
                className="narration-input"
                placeholder={isBook
                  ? `Describe scene ${i + 1}... (e.g. "A boy walks through a rice field at sunset. His water buffalo follows.")`
                  : `Panel ${i + 1} narration...`}
                value={scene.narration_text}
                onChange={(e) => updateScene(scene.id, e.target.value)}
                onBlur={(e) => saveScene(scene.id, e.target.value)}
                rows={3}
              />
              <div className="scene-preview">
                {generatingId === scene.id ? (
                  <div className="generating">
                    <div className="spinner" />
                    Generating...
                  </div>
                ) : scene.rendered_image_url ? (
                  <iframe
                    srcDoc={`<html><body style="margin:0;background:#1a1a2e"><p style="color:#e4e4e4;padding:1rem;font-family:sans-serif">${isBook ? 'Scene' : 'Panel'} ${i + 1}</p></body></html>`}
                    title={`Preview ${i + 1}`}
                    className="scene-preview-frame"
                  />
                ) : null}
              </div>
              <button
                className="generate-btn"
                onClick={() => generateScene(scene)}
                disabled={generatingId === scene.id}
              >
                {generatingId === scene.id ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="editor-footer">
        <button className="buy-btn" onClick={addScene}>
          + Add {isBook ? 'Scene' : 'Panel'}
        </button>
        <button
          className="buy-btn"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}
          onClick={() => updateProject({ status: 'published' })}
        >
          Publish
        </button>
      </div>
    </div>
  );
}
