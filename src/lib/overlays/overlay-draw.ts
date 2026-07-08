/** Funções de desenho compartilhadas entre overlay runtime e previews. */

export function drawDenseNoise(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.createImageData(width, height);
  const buffer = imageData.data;
  for (let i = 0; i < buffer.length; i += 4) {
    const v = Math.random() * 255;
    buffer[i] = v;
    buffer[i + 1] = v;
    buffer[i + 2] = v;
    buffer[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

export function drawSparse(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  density = 0.04,
): void {
  ctx.clearRect(0, 0, width, height);
  const count = width * height * density;
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 2 + 0.5;
    ctx.fillStyle = "white";
    ctx.fillRect(x, y, size, size);
  }
}

export function drawScanlines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  offset: number,
): void {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "white";
  for (let y = offset; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1);
  }
}

export function drawGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  density = 0.08,
): void {
  ctx.clearRect(0, 0, width, height);
  const count = width * height * density;
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const shade = Math.random() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${shade},${shade},${shade},${Math.random() * 0.8})`;
    ctx.fillRect(x, y, 1, 1);
  }
}

export function scanlineOffsetFromTime(timestamp = Date.now()): number {
  return (timestamp / 50) % 4;
}
