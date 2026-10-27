export type GameMapId = 'default' | 'red-canyon';

export interface MapMetadata {
  id: GameMapId;
  name: string;
  theme: string;
  tagline: string;
  badge: string;
  previewBg: string;
  previewBorder: string;
  previewCliff: string;
}

export const MAP_CONFIGS: Record<GameMapId, MapMetadata> = {
  default: {
    id: 'default',
    name: 'Tập Vở Ô Ly (Mặc định)',
    theme: 'notebook',
    tagline: 'Nền giấy kẻ ô ly kem thanh lịch, phong cách hoài niệm cổ điển.',
    badge: 'MẶC ĐỊNH',
    previewBg: '#FBF8F0',
    previewBorder: '#C8DDE6',
    previewCliff: '#E0E0E0',
  },
  'red-canyon': {
    id: 'red-canyon',
    name: 'Hẻm Núi Đỏ (Red Canyon)',
    theme: 'canyon',
    tagline: 'Sa mạc đất nung doodle 2D, núi mesa tầng lớp, vách đá sẫm màu & bụi cát.',
    badge: 'MỚI',
    previewBg: '#DE764A',
    previewBorder: '#B84E26',
    previewCliff: '#281311',
  },
} as const;

/**
 * Determines the active map.
 * Priority:
 * 1. Query parameter ?map=red-canyon (or ?map=default)
 * 2. Session storage override 'ponpi_active_map'
 * 3. Local storage 'ponpi_active_map'
 * 4. Default: 'default' (Notebook grid)
 */
export function getActiveMapId(): GameMapId {
  if (typeof window === 'undefined') return 'default';

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const mapQuery = urlParams.get('map')?.toLowerCase();

    if (mapQuery === 'red-canyon') return 'red-canyon';
    if (mapQuery === 'default') return 'default';

    const sessionMap = sessionStorage.getItem('ponpi_active_map')?.toLowerCase();
    if (sessionMap === 'red-canyon') return 'red-canyon';
    if (sessionMap === 'default') return 'default';

    const localMap = localStorage.getItem('ponpi_active_map')?.toLowerCase();
    if (localMap === 'red-canyon') return 'red-canyon';
    if (localMap === 'default') return 'default';
  } catch {
    // Fallback safely if browser storage / search params access fails
  }

  return 'default';
}

export function setActiveMapId(mapId: GameMapId): void {
  if (typeof window === 'undefined') return;

  try {
    if (mapId === 'default') {
      sessionStorage.removeItem('ponpi_active_map');
      localStorage.removeItem('ponpi_active_map');
      const url = new URL(window.location.href);
      if (url.searchParams.has('map')) {
        url.searchParams.delete('map');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + url.hash);
      }
    } else {
      sessionStorage.setItem('ponpi_active_map', mapId);
      localStorage.setItem('ponpi_active_map', mapId);
      const url = new URL(window.location.href);
      url.searchParams.set('map', mapId);
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
  } catch {
    // Ignore storage/history errors in restricted environments
  }
}
