import { loadScript } from '../../scripts/aem.js';

/**
 * Loads and initializes a Lottie animation
 * @param {Element} block the block element
 */
export default async function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');
  
  let fileUrl = '';
  let align = 'center';
  let loop = false;

  rows.forEach((row) => {
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length >= 2) {
      const label = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim();

      if (label === 'file-url') {
        fileUrl = value;
      } else if (label === 'align') {
        align = value;
      } else if (label === 'loop') {
        loop = value.toLowerCase() === 'true';
      }
    }
  });

  // eslint-disable-next-line no-console
  console.log('Lottie block config:', { fileUrl, align, loop });

  if (!fileUrl) {
    block.textContent = 'Error: No file-url provided';
    return;
  }

  const container = document.createElement('div');
  container.className = 'lottie-container';
  
  if (align) {
    container.classList.add(`align-${align}`);
  }

  block.replaceChildren(container);

  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js');

    // eslint-disable-next-line no-console
    console.log('Lottie library loaded, initializing animation...');

    const animation = window.lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: false,
      autoplay: !loop,
      path: fileUrl,
    });

    animation.addEventListener('DOMLoaded', () => {
      // eslint-disable-next-line no-console
      console.log('Lottie animation loaded successfully');
    });

    animation.addEventListener('data_failed', () => {
      // eslint-disable-next-line no-console
      console.error('Failed to load Lottie data from:', fileUrl);
      container.textContent = 'Error: Failed to load animation data';
    });

    if (loop) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animation.goToAndPlay(0);
          }
        });
      }, {
        threshold: 0.1,
      });

      observer.observe(block);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load Lottie animation:', error);
    container.textContent = 'Error loading animation';
  }
}
