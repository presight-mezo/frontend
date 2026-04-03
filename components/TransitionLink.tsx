'use client';

import { useRouter } from 'next/navigation';

export function useBubbleTransition() {
  const router = useRouter();

  const morphTo = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>, href: string, bubbleColor = '#0a0a0a') => {
    e.preventDefault();

    const x = e.clientX;
    const y = e.clientY;

    // Create the bubble DOM element
    const bubble = document.createElement('div');
    bubble.style.position = 'fixed';
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;
    bubble.style.width = '0px';
    bubble.style.height = '0px';
    bubble.style.borderRadius = '50%';
    bubble.style.backgroundColor = bubbleColor;
    bubble.style.zIndex = '999999';
    bubble.style.pointerEvents = 'none';
    bubble.style.transform = 'translate(-50%, -50%)';
    bubble.style.transition = 'width 1.5s cubic-bezier(0.22, 1, 0.36, 1), height 1.5s cubic-bezier(0.22, 1, 0.36, 1)';

    document.body.appendChild(bubble);

    // Trigger animation next frame
    requestAnimationFrame(() => {
      // 300vmax ensures it covers everything regardless of corner click
      bubble.style.width = '300vmax';
      bubble.style.height = '300vmax';
    });

    // Wait for the bubble to cover the screen entirely
    setTimeout(() => {
      router.push(href);

      // Once route changes, smoothly fade the bubble out!
      setTimeout(() => {
        bubble.style.transition = 'opacity 1.5s ease';
        bubble.style.opacity = '0';

        // Remove it from the DOM after fading out
        setTimeout(() => {
          bubble.remove();
        }, 1500);
      }, 300); // give Next.js 300ms extra to render the new page
    }, 1500);
  };

  return { morphTo };
}
