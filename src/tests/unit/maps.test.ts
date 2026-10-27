import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getActiveMapId, setActiveMapId, MAP_CONFIGS } from '../../config/maps';
import { drawRedCanyonBackground } from '../../game/assets/RedCanyonBackground';

function createMockContext2D(): any {
  const gradientMock = {
    addColorStop: vi.fn(),
  };

  return {
    createLinearGradient: vi.fn(() => gradientMock),
    createRadialGradient: vi.fn(() => gradientMock),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    roundRect: vi.fn(),
    setLineDash: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    lineCap: 'butt',
  };
}

describe('Map Selection & Red Canyon Background Renderer', () => {
  beforeEach(() => {
    sessionStorage.clear();
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState({}, '', url.pathname);
  });

  it('defaults to the default notebook map when no query or session is present', () => {
    expect(getActiveMapId()).toBe('default');
    expect(MAP_CONFIGS.default.id).toBe('default');
  });

  it('activates red-canyon when URL contains ?map=red-canyon', () => {
    const url = new URL(window.location.href);
    url.searchParams.set('map', 'red-canyon');
    window.history.replaceState({}, '', url.pathname + url.search);

    expect(getActiveMapId()).toBe('red-canyon');
  });

  it('updates session storage, local storage and URL when setActiveMapId is called', () => {
    setActiveMapId('red-canyon');
    expect(getActiveMapId()).toBe('red-canyon');
    expect(sessionStorage.getItem('ponpi_active_map')).toBe('red-canyon');
    expect(localStorage.getItem('ponpi_active_map')).toBe('red-canyon');

    // Switch back to default
    setActiveMapId('default');
    expect(getActiveMapId()).toBe('default');
    expect(sessionStorage.getItem('ponpi_active_map')).toBeNull();
    expect(localStorage.getItem('ponpi_active_map')).toBeNull();
  });

  it('renders Red Canyon background across multiple viewport sizes and DPR ratios without throwing', () => {
    const testViewports = [
      { name: 'Narrow mobile portrait', width: 360, height: 800, dpr: 2 },
      { name: 'Mobile landscape', width: 800, height: 360, dpr: 2 },
      { name: 'Desktop widescreen', width: 1366, height: 768, dpr: 1 },
      { name: 'Square window', width: 700, height: 700, dpr: 1.5 },
    ];

    const mockCtx = createMockContext2D();

    // Mock createElement('canvas').getContext('2d')
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName === 'canvas') {
        (el as HTMLCanvasElement).getContext = vi.fn((type: string) => (type === '2d' ? createMockContext2D() : null)) as any;
      }
      return el;
    });

    for (const vp of testViewports) {
      window.devicePixelRatio = vp.dpr;

      expect(() => {
        drawRedCanyonBackground(mockCtx, vp.width, vp.height, 1.0, 1000, {
          reduceMotion: false,
          defenseLineY: 638,
        });
      }).not.toThrow();

      // Test with reduced motion
      expect(() => {
        drawRedCanyonBackground(mockCtx, vp.width, vp.height, 0.65, 2000, {
          reduceMotion: true,
          defenseLineY: 638,
        });
      }).not.toThrow();
    }

    vi.restoreAllMocks();
  });
});
