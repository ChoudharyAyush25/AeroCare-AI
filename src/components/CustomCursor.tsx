import { useEffect, useRef } from 'react';

const INTERACTIVE_SELECTOR =
  'button, a, input, select, textarea, [role="button"], [data-cursor="interactive"]';

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rippleLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canUseCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canUseCursor) return;

    const cursor = cursorRef.current;
    const core = coreRef.current;
    const ring = ringRef.current;
    const rippleLayer = rippleLayerRef.current;
    if (!cursor || !core || !ring || !rippleLayer) return;

    let targetX = -100;
    let targetY = -100;
    let ringX = targetX;
    let ringY = targetY;
    let frameId = 0;
    let isInteractive = false;

    const setCursorColor = (element: Element | null) => {
      const className = element?.getAttribute('class') || '';
      const color = /rose|red|danger|severe|extreme/i.test(className)
        ? 'coral'
        : /amber|orange|warning|moderate/i.test(className)
        ? 'amber'
        : 'bio';
      cursor.dataset.tone = color;
    };

    const animate = () => {
      if (prefersReducedMotion) {
        ringX = targetX;
        ringY = targetY;
      } else {
        ringX += (targetX - ringX) * 0.14;
        ringY += (targetY - ringY) * 0.14;
      }

      core.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      frameId = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      cursor.dataset.visible = 'true';
      const interactiveElement = (event.target as Element | null)?.closest(INTERACTIVE_SELECTOR);
      const nextInteractive = Boolean(interactiveElement);

      if (nextInteractive !== isInteractive) {
        isInteractive = nextInteractive;
        cursor.dataset.interactive = String(isInteractive);
      }
      setCursorColor(interactiveElement);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (prefersReducedMotion) return;
      const ripple = document.createElement('span');
      ripple.className = 'aerocare-cursor-ripple';
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      rippleLayer.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    };

    const handlePointerLeave = () => {
      cursor.dataset.visible = 'false';
    };

    const handlePointerEnter = () => {
      cursor.dataset.visible = 'true';
    };

    document.documentElement.classList.add('aerocare-cursor-enabled');
    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('pointerenter', handlePointerEnter);
    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      document.documentElement.classList.remove('aerocare-cursor-enabled');
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('pointerenter', handlePointerEnter);
    };
  }, []);

  return (
    <div ref={cursorRef} className="aerocare-cursor" data-tone="bio" data-visible="false" data-interactive="false" aria-hidden="true">
      <div ref={coreRef} className="aerocare-cursor-core" />
      <div ref={ringRef} className="aerocare-cursor-ring">
        <span className="aerocare-cursor-ring-mark" />
      </div>
      <div ref={rippleLayerRef} className="aerocare-cursor-ripples" />
    </div>
  );
};
