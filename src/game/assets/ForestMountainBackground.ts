import {
  drawSvgMapBackground,
  getSvgMapImage,
  SvgMapRenderOptions,
} from './SvgMapBackground';

export type ForestMountainRenderOptions = SvgMapRenderOptions;

export const FOREST_MOUNTAIN_SVG = '/phong_canh_nui_rung_1920x1080.svg';

export function getForestMountainImage(): HTMLImageElement | null {
  return getSvgMapImage(FOREST_MOUNTAIN_SVG);
}

/**
 * Draws the Forest Mountain SVG background onto the canvas.
 */
export function drawForestMountainBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  visualScale: number,
  options: ForestMountainRenderOptions = {}
): void {
  drawSvgMapBackground(ctx, width, height, visualScale, FOREST_MOUNTAIN_SVG, options);
}
