export type GameMapId =
  | 'default'
  | 'forest-mountain'
  | 'ice-valley'
  | 'haunted-forest'
  | 'desert'
  | 'stadium'
  | 'blizzard'
  | 'green-forest'
  | 'rainforest'
  | 'countryside';

export interface MapMetadata {
  id: GameMapId;
  name: string;
  theme: string;
  tagline: string;
  badge: string;
  emoji: string;
  previewBg: string;
  previewBorder: string;
  previewImage?: string;
  accentColor: string;
}

export const MAP_CONFIGS: Record<GameMapId, MapMetadata> = {
  default: {
    id: 'default',
    name: 'Tập Vở Ô Ly (Mặc định)',
    theme: 'notebook',
    tagline: 'Nền giấy kẻ ô ly kem thanh lịch, phong cách hoài niệm cổ điển.',
    badge: 'MẶC ĐỊNH',
    emoji: '📝',
    previewBg: '#FBF8F0',
    previewBorder: '#C8DDE6',
    accentColor: '#4A6B82',
  },
  'forest-mountain': {
    id: 'forest-mountain',
    name: 'Phong Cảnh Núi Rừng',
    theme: 'nature',
    tagline: 'Dãy núi hùng vĩ, mây ngàn và rừng thông bạt ngàn trong nắng sớm.',
    badge: 'NÚI RỪNG',
    emoji: '🌲',
    previewBg: '#C8583F',
    previewBorder: '#79352F',
    previewImage: '/phong_canh_nui_rung_1920x1080.svg',
    accentColor: '#C8583F',
  },
  'ice-valley': {
    id: 'ice-valley',
    name: 'Thung Lũng Băng Tuyết',
    theme: 'ice',
    tagline: 'Dãy núi tuyết ngút ngàn, dòng sông băng và rừng thông phủ sương tuyết.',
    badge: 'BĂNG TUYẾT',
    emoji: '❄️',
    previewBg: '#37617c',
    previewBorder: '#729fb3',
    previewImage: '/map_02_bang_tuyet.svg',
    accentColor: '#2B6682',
  },
  'haunted-forest': {
    id: 'haunted-forest',
    name: 'Rừng Ma Ám',
    theme: 'mystery',
    tagline: 'Đêm trăng tím huyền bí, lâu đài cổ ma mị và rừng cây kỳ bí.',
    badge: 'MA ÁM',
    emoji: '🏰',
    previewBg: '#302741',
    previewBorder: '#775274',
    previewImage: '/map_03_rung_ma_am.svg',
    accentColor: '#6B3A67',
  },
  desert: {
    id: 'desert',
    name: 'Sa Mạc Cổ Đại',
    theme: 'desert',
    tagline: 'Đồi cát vàng rực rỡ dưới hoàng hôn, kim tự tháp và rặng xương rồng.',
    badge: 'SA MẠC',
    emoji: '🏜️',
    previewBg: '#b86f53',
    previewBorder: '#ad6a60',
    previewImage: '/map_04_sa_mac.svg',
    accentColor: '#B25E29',
  },
  stadium: {
    id: 'stadium',
    name: 'Sân Vận Động',
    theme: 'stadium',
    tagline: 'Chảo lửa sân cỏ sôi động với vạch vôi trắng, khung thành và hàng ngàn khán giả reo hò.',
    badge: 'SÂN CỎ',
    emoji: '⚽',
    previewBg: '#3a8063',
    previewBorder: '#203e39',
    previewImage: '/map_06_san_bong.svg',
    accentColor: '#2E7D32',
  },
  blizzard: {
    id: 'blizzard',
    name: 'Bão Tuyết Bắc Cực',
    theme: 'blizzard',
    tagline: 'Cơn bão tuyết cuồng nộ, bầu trời lạnh giá và những rặng thông băng giá ngút ngàn.',
    badge: 'BÃO TUYẾT',
    emoji: '🌨️',
    previewBg: '#596d88',
    previewBorder: '#8094ab',
    previewImage: '/map_07_bao_tuyet.svg',
    accentColor: '#46637F',
  },
  'green-forest': {
    id: 'green-forest',
    name: 'Rừng Xanh Đại Ngàn',
    theme: 'green-forest',
    tagline: 'Rừng xanh bạt ngàn hoa lá, đồi cỏ non mướt mát và dòng suối nhỏ trong veo.',
    badge: 'RỪNG XANH',
    emoji: '🌳',
    previewBg: '#4c806b',
    previewBorder: '#6e9a86',
    previewImage: '/map_08_rung_xanh.svg',
    accentColor: '#2E7D56',
  },
  rainforest: {
    id: 'rainforest',
    name: 'Rừng Nhiệt Đới',
    theme: 'rainforest',
    tagline: 'Tán rừng rậm nhiệt đới hoang sơ với dây leo cổ thụ, thác nước và rặng dừa nghiêng bóng.',
    badge: 'NHIỆT ĐỚI',
    emoji: '🌴',
    previewBg: '#317b71',
    previewBorder: '#276b57',
    previewImage: '/map_09_rung_nhiet_doi.svg',
    accentColor: '#1B6A5D',
  },
  countryside: {
    id: 'countryside',
    name: 'Đồng Quê Yên Bình',
    theme: 'countryside',
    tagline: 'Ngoại ô thanh bình với ngôi nhà trang trại mái đỏ, cánh đồng hoa và đồi cỏ êm đềm.',
    badge: 'ĐỒNG QUÊ',
    emoji: '🏡',
    previewBg: '#7aab72',
    previewBorder: '#8fac86',
    previewImage: '/map_10_dong_que.svg',
    accentColor: '#5D8B4E',
  },
} as const;

export const ALL_MAP_IDS: GameMapId[] = [
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
];

function resolveMapAlias(val?: string | null): GameMapId | null {
  if (!val) return null;
  const key = val.trim().toLowerCase();

  if (key === 'default' || key === 'notebook') return 'default';

  if (
    key === 'forest-mountain' ||
    key === 'forest' ||
    key === 'nui-rung' ||
    key === 'phong-canh-nui-rung' ||
    key === 'red-canyon'
  ) {
    return 'forest-mountain';
  }

  if (
    key === 'ice-valley' ||
    key === 'ice' ||
    key === 'bang-tuyet' ||
    key === 'thung-lung-bang-tuyet' ||
    key === 'map-02' ||
    key === 'map_02' ||
    key === 'map02'
  ) {
    return 'ice-valley';
  }

  if (
    key === 'haunted-forest' ||
    key === 'haunted' ||
    key === 'rung-ma-am' ||
    key === 'map-03' ||
    key === 'map_03' ||
    key === 'map03'
  ) {
    return 'haunted-forest';
  }

  if (
    key === 'desert' ||
    key === 'sa-mac' ||
    key === 'sa-mac-co-dai' ||
    key === 'map-04' ||
    key === 'map_04' ||
    key === 'map04'
  ) {
    return 'desert';
  }

  if (
    key === 'stadium' ||
    key === 'san-bong' ||
    key === 'san-van-dong' ||
    key === 'football' ||
    key === 'soccer' ||
    key === 'map-06' ||
    key === 'map_06' ||
    key === 'map06'
  ) {
    return 'stadium';
  }

  if (
    key === 'blizzard' ||
    key === 'bao-tuyet' ||
    key === 'snowstorm' ||
    key === 'map-07' ||
    key === 'map_07' ||
    key === 'map07'
  ) {
    return 'blizzard';
  }

  if (
    key === 'green-forest' ||
    key === 'rung-xanh' ||
    key === 'rung-xanh-dai-ngan' ||
    key === 'forest-green' ||
    key === 'map-08' ||
    key === 'map_08' ||
    key === 'map08'
  ) {
    return 'green-forest';
  }

  if (
    key === 'rainforest' ||
    key === 'rung-nhiet-doi' ||
    key === 'tropical' ||
    key === 'jungle' ||
    key === 'map-09' ||
    key === 'map_09' ||
    key === 'map09'
  ) {
    return 'rainforest';
  }

  if (
    key === 'countryside' ||
    key === 'dong-que' ||
    key === 'dong-que-yen-binh' ||
    key === 'farm' ||
    key === 'village' ||
    key === 'map-10' ||
    key === 'map_10' ||
    key === 'map10'
  ) {
    return 'countryside';
  }

  return null;
}

/**
 * Determines the active map.
 * Priority:
 * 1. Query parameter ?map=...
 * 2. Session storage override 'ponpi_active_map'
 * 3. Local storage 'ponpi_active_map'
 * 4. Default: 'default' (Notebook grid)
 */
export function getActiveMapId(): GameMapId {
  if (typeof window === 'undefined') return 'default';

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const resolvedUrl = resolveMapAlias(urlParams.get('map'));
    if (resolvedUrl) return resolvedUrl;

    const resolvedSession = resolveMapAlias(sessionStorage.getItem('ponpi_active_map'));
    if (resolvedSession) return resolvedSession;

    const resolvedLocal = resolveMapAlias(localStorage.getItem('ponpi_active_map'));
    if (resolvedLocal) return resolvedLocal;
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
