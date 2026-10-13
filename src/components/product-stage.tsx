'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { WatchEngine } from '@/lib/watch-engine';
import type { ViewPreset } from '@/lib/experience-state';

declare global {
  interface Window { __VYREN?: { diagnostics: () => ReturnType<WatchEngine['diagnostics']>; capturePose: (name: ViewPreset, factor?: number) => ReturnType<WatchEngine['diagnostics']>; releaseCapture: () => void }; }
}
export default function ProductStage() {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('waiting');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<HTMLElement | null>(null);
  const retry = useRef<() => void>(() => {});
  useEffect(() => {
    let engine: WatchEngine | undefined; let cancelled = false; let loading = false; let generation = 0;
    const start = async (force = false) => {
      if ((loading && !force) || cancelled || !host.current) return;
      const current = ++generation;
      const active = () => !cancelled && current === generation;
      engine?.dispose(); engine = undefined; delete window.__VYREN;
      loading = true; setStatus('loading'); setProgress(0); setError('');
      try {
        const { WatchEngine: Engine } = await import('@/lib/watch-engine');
        if (!active() || !host.current) return;
        engine = new Engine(host.current, { progress: (loaded, total) => { if (active()) setProgress(Math.min(100, Math.round(loaded / total * 100))); }, ready: () => { if (active()) { setError(''); setStatus('ready'); } }, error: message => { if (active()) { setError(message); setStatus('error'); } } });
        const currentEngine = engine;
        window.__VYREN = { diagnostics: () => currentEngine.diagnostics(), capturePose: (name, factor) => currentEngine.capturePose(name, factor), releaseCapture: () => currentEngine.releaseCapture() };
      } catch (e) { if (active()) { setError(e instanceof Error ? e.message : 'WebGL is not available'); setStatus('error'); } }
    };
    retry.current = () => { void start(true); };
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setFeedback(document.getElementById('viewer-feedback')); void start(); } }, { rootMargin: '900px 0px' });
    document.querySelectorAll('.webgl-slot').forEach(slot => observer.observe(slot));
    return () => { cancelled = true; generation++; observer.disconnect(); engine?.dispose(); delete window.__VYREN; };
  }, []);
  useEffect(() => { document.documentElement.dataset.studio = status; window.dispatchEvent(new CustomEvent('vyren-studio-status', { detail: status })); return () => { delete document.documentElement.dataset.studio; }; }, [status]);
  return <><div ref={host} className="persistent-stage" />{feedback && createPortal(<div className="studio-status" role="status" aria-live="polite">{status === 'loading' || status === 'waiting' ? <><span>Preparing your closer look</span><span className="loading-line" aria-hidden="true"><i style={{ transform: `scaleX(${progress / 100})` }} /></span><span>{progress}%</span></> : status === 'error' ? <><span>Watch preview available</span><button onClick={() => retry.current()}>Try again</button><span className="sr-only">{error}</span></> : <span>Ready to explore</span>}</div>, feedback)}</>;
}
