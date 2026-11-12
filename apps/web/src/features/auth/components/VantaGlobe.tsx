import { useEffect, useRef } from 'react';

// Vanta GLOBE effect using THREE.js
// Colors: purple nodes (0x603fff) on near-black (0x100f18) — dark & sleek
declare global {
  interface Window {
    THREE: unknown;
    VANTA: {
      GLOBE: (opts: Record<string, unknown>) => { destroy: () => void };
    };
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload  = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export default function VantaGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const effectRef    = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Load THREE first, then Vanta GLOBE
        await loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js',
        );
        await loadScript(
          'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js',
        );

        if (cancelled || !containerRef.current || !window.VANTA?.GLOBE) return;

        effectRef.current = window.VANTA.GLOBE({
          el:            containerRef.current,
          THREE:         window.THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls:  false,
          minHeight:     200,
          minWidth:      200,
          scale:         1.0,
          scaleMobile:   1.0,
          color:         0x603fff,   // purple nodes
          color2:        0x8b5cf6,   // lighter purple lines
          backgroundColor: 0x100f18, // near-black background
          size:          1.2,
          points:        10,
          maxDistance:   22,
          spacing:       15,
        });
      } catch (err) {
        // Silently fail — login form still works without the animation
        console.warn('[VantaGlobe] Could not load animation:', err);
      }
    }

    init();

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className='fixed inset-0 -z-10'
      aria-hidden='true'
    />
  );
}
