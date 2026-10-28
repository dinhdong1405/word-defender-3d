/**
 * Resolves an asset path against Vite's base URL (e.g. /word-defender-3d/ in production).
 * Handles external URLs, data URLs, and root-relative paths.
 */
export function getAssetUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : base + '/';
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  return cleanBase + cleanUrl;
}
