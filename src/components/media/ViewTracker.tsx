'use client';
import { useEffect } from 'react';

export function ViewTracker({ id }: { id: string }) {
  useEffect(() => {
    let fired = false;

    const track = () => {
      if (fired) return;
      fired = true;
      fetch('/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    };

    track();

    // bfcache 복원(뒤로가기) 시 재카운트
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fired = false;
        track();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [id]);

  return null;
}
