/** Resolução máxima do buffer de render — noise não precisa de tela cheia. */
export const NOISE_MAX_BUFFER_WIDTH = 480;
export const NOISE_MAX_BUFFER_HEIGHT = 270;

/** Tile fixo para noise denso — drawImage upscale é muito mais barato que putImageData fullscreen. */
export const DENSE_NOISE_TILE_SIZE = 128;
export const DENSE_NOISE_FRAME_COUNT = 6;

/** Buffer fixo para sparse/grain — frames pré-cacheados em baixa resolução. */
export const GRAIN_BUFFER_WIDTH = 320;
export const GRAIN_BUFFER_HEIGHT = 180;
export const NOISE_FRAME_CACHE_COUNT = 5;

export const SCANLINE_RENDER_SCALE = 0.75;
export const NOISE_RENDER_SCALE = 1;

export const SCANLINE_FRAME_INTERVAL_MS = 50;
export const NOISE_FRAME_INTERVAL_MS = 120;
