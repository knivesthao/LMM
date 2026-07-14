import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const API_BASE = import.meta.env.DEV
  ? '' // Dev: use inline stub
  : '/api'; // Production: route through Workers

export function useGenerate() {
  const generate = useCallback(
    async (sceneText: string, sceneNumber: number, projectId: string) => {
      // Dev / stub: simulate a generation with mock result
      if (import.meta.env.DEV) {
        await new Promise((r) => setTimeout(r, 2000));
        const mockUrl = `/mock/content/1/scene_${((sceneNumber - 1) % 5) + 1}.html`;
        return mockUrl;
      }

      // Production: queue via Workers → Supabase → RunPod
      const res = await fetch(`${API_BASE}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene_text: sceneText,
          project_id: projectId,
          scene_number: sceneNumber,
        }),
      });

      if (!res.ok) throw new Error('Render queue failed');

      const { job_id } = await res.json() as { job_id: string };
      return pollForResult(job_id);
    },
    []
  );

  return generate;
}

async function pollForResult(
  jobId: string,
  maxAttempts = 60,
  intervalMs = 3000
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, intervalMs));

    const res = await fetch(`${API_BASE}/render/${jobId}`);
    if (!res.ok) continue;

    const data = await res.json() as { status: string; result_url?: string };

    if (data.status === 'complete') return data.result_url ?? '';
    if (data.status === 'failed') throw new Error('Render failed');
  }

  throw new Error('Render timed out');
}

interface RenderQueueItem {
  id: string;
  status: string;
  scene_number: number;
  scene_text: string;
  created_at: string;
}

export function useRenderQueue() {
  const pollQueue = useCallback(
    async (callback: (item: RenderQueueItem) => Promise<void>) => {
      const { data } = await supabase
        .from('render_queue')
        .select('*')
        .eq('status', 'queued')
        .order('created_at');

      if (!data?.length) return;

      for (const item of data) {
        await supabase
          .from('render_queue')
          .update({ status: 'parsing' })
          .eq('id', item.id);

        try {
          await callback(item as RenderQueueItem);
        } catch {
          await supabase
            .from('render_queue')
            .update({ status: 'failed' })
            .eq('id', item.id);
        }
      }
    },
    []
  );

  return pollQueue;
}
