import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getActiveMapId, setActiveMapId, MAP_CONFIGS, ALL_MAP_IDS, GameMapId } from '../../config/maps';
import { drawForestMountainBackground } from '../../game/assets/ForestMountainBackground';
import { drawSvgMapBackground } from '../../game/assets/SvgMapBackground';

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

describe('Multi-Map System & Dynamic SVG Renderers (10 Maps)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState({}, '', url.pathname);
  });

  it('registers all 10 maps with valid metadata, badges, and preview images', () => {
    expect(ALL_MAP_IDS).toEqual([
      'default',
      'forest-mountain',
      'ice-valley',
      'haunted-forest',
      'desert',
      'stadium',
      'blizzard',
      'green-forest',
      'rainforest',
      'countryside',
    ]);

    for (const mapId of ALL_MAP_IDS) {
      const config = MAP_CONFIGS[mapId];
      expect(config).toBeDefined();
      expect(config.id).toBe(mapId);
      expect(config.name).toBeTruthy();
      expect(config.tagline).toBeTruthy();
      expect(config.badge).toBeTruthy();
      expect(config.emoji).toBeTruthy();
      expect(config.previewBg).toBeTruthy();
      expect(config.accentColor).toBeTruthy();
      if (mapId !== 'default') {
        expect(config.previewImage).toMatch(/\.svg$/);
      }
    }
  });

  it('defaults to the default notebook map when no query or session is present', () => {
    expect(getActiveMapId()).toBe('default');
    expect(MAP_CONFIGS.default.id).toBe('default');
  });

  it('resolves map aliases correctly via URL search query for all maps', () => {
    const url = new URL(window.location.href);

    // 1. Forest Mountain
    url.searchParams.set('map', 'nui-rung');
    window.history.replaceState({}, '', url.pathname + url.search);
    expect(getActiveMapId()).toBe('forest-mountain');

    // 2. Ice Valley
    url.searchParams.set('map', 'bang-tuyet');
    window.history.replaceState({}, '', url.pathname + url.search);
    expect(getActiveMapId()).toBe('ice-valley');

    url.searchParams.set('map', 'map-02');
    window.history.replaceState({}, '', url.pathname + url.search);
    expect(getActiveMapId()).toBe('ice-valley');

    // 3. Haunted Forest
    url.searchParams.set('map', 'rung-ma-am');
    window.history.replaceState({}, '', url.pathname + url.search);
    expect(getActiveMapId()).toBe('haunted-forest');

    url.searchParams.set('map', 'map-03');
    window.history.replaceState({}, '', url.pathname + url.search);
    expect(getActiveMapId()).toBe('haunted-forest');

    // 4. Desert
    url.searchParams.set('map', 'sa-mac');
    window.history.replaceState({}, '', url.pathname + url.search);
    expect(getActiveMapId()).toBe('desert');

    url.searchParams.set('map', 'map-04');
    window.history.replaceState({}, '', url.pathname + url.search);
    expect(getActiveMapId()).toBe('desert');

    // 5. Stadium (Map 06)
    url.searchParams.set('map', 'san-bong');
    window.history.replaceState({}, '', url.pathname + url.search);
    expect(getActiveMapId()).toBe('stadium');

    url.searchParams.set('map', 'map-06');
    window.history.replaceState({}, '', url.pathname + url.search);
    expect(getActiveMapId()).toBe('stadium');

    // 6. Blizzard (Map 07)
    url.searchParams.set('map', 'bao-tuyet');
    window.history.replaceState({}, '', url.pathname + url.search);
    expect(getActiveMapId()).toBe('blizzard');

    url.searchParams.set('map', 'map-07');
    window.history.replaceState({}, '', url.pathname + url.search);
    expect(getActiveMapId()).toBe('blizzard');

    // 7. Green Forest (Map 08)
    url.searchParams.set('map', 'rung-xanh');
    window.history.replaceState({}, '', url.pathname + url.search);
    expect(getActiveMapId()).toBe('green-forest');

    url.searchParams.set('map', 'map-08');
    window.history.replaceState({}, '', url.pathname + url.search);
    expect(getActiveMapId()).toBe('green-forest');

    // 8. Rainforest (Map 09)
    url.searchParams.set('map', 'rung-nhiet-doi');
    window.history.replaceState({}, '', url.pathname + url.search);
    expect(getActiveMapId()).toBe('rainforest');

    url.searchParams.set('map', 'map-09');
    window.history.replaceState({}, '', url.pathname + url.search);
    expect(getActiveMapId()).toBe('rainforest');

    // 9. Countryside (Map 10)
    url.searchParams.set('map', 'dong-que');
    window.history.replaceState({}, '', url.pathname + url.search);
    expect(getActiveMapId()).toBe('countryside');

    url.searchParams.set('map', 'map-10');
    window.history.replaceState({}, '', url.pathname + url.search);
    expect(getActiveMapId()).toBe('countryside');

    // 10. Default
    url.searchParams.set('map', 'default');
    window.history.replaceState({}, '', url.pathname + url.search);
    expect(getActiveMapId()).toBe('default');
  });

  it('updates session storage, local storage and URL when setActiveMapId is called for each map', () => {
    const mapsToTest: GameMapId[] = [
      'forest-mountain',
      'ice-valley',
      'haunted-forest',
      'desert',
      'stadium',
      'blizzard',
      'green-forest',
      'rainforest',
      'countryside',
    ];

    for (const mapId of mapsToTest) {
      setActiveMapId(mapId);
      expect(getActiveMapId()).toBe(mapId);
      expect(sessionStorage.getItem('ponpi_active_map')).toBe(mapId);
      expect(localStorage.getItem('ponpi_active_map')).toBe(mapId);
    }

    // Switch back to default
    setActiveMapId('default');
    expect(getActiveMapId()).toBe('default');
    expect(sessionStorage.getItem('ponpi_active_map')).toBeNull();
    expect(localStorage.getItem('ponpi_active_map')).toBeNull();
  });

  it('renders all SVG map backgrounds across multiple viewport sizes and DPR ratios without throwing', () => {
    const testViewports = [
      { name: 'Narrow mobile portrait', width: 360, height: 800, dpr: 2 },
      { name: 'Mobile landscape', width: 800, height: 360, dpr: 2 },
      { name: 'Desktop widescreen', width: 1366, height: 768, dpr: 1 },
      { name: 'Square window', width: 700, height: 700, dpr: 1.5 },
    ];

    const svgUrls = [
      '/phong_canh_nui_rung_1920x1080.svg',
      '/map_02_bang_tuyet.svg',
      '/map_03_rung_ma_am.svg',
      '/map_04_sa_mac.svg',
      '/map_06_san_bong.svg',
      '/map_07_bao_tuyet.svg',
      '/map_08_rung_xanh.svg',
      '/map_09_rung_nhiet_doi.svg',
      '/map_10_dong_que.svg',
    ];

    const mockCtx = createMockContext2D();

    for (const svgUrl of svgUrls) {
      for (const vp of testViewports) {
        window.devicePixelRatio = vp.dpr;

        expect(() => {
          drawSvgMapBackground(mockCtx, vp.width, vp.height, 1.0, svgUrl, {
            reduceMotion: false,
            defenseLineY: 638,
          });
        }).not.toThrow();

        // Also test with reduced motion
        expect(() => {
          drawSvgMapBackground(mockCtx, vp.width, vp.height, 0.65, svgUrl, {
            reduceMotion: true,
            defenseLineY: 638,
          });
        }).not.toThrow();
      }
    }

    // Backward-compatible Forest Mountain test
    expect(() => {
      drawForestMountainBackground(mockCtx, 1920, 1080, 1.0, {
        reduceMotion: false,
        defenseLineY: 638,
      });
    }).not.toThrow();
  });
});
