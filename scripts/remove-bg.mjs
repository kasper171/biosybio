import { Jimp } from "jimp";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const input  = resolve(__dirname, "../src/assets/logo.png");
const output = resolve(__dirname, "../src/assets/logo.png");

const img = await Jimp.read(input);

img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
  const r = this.bitmap.data[idx + 0];
  const g = this.bitmap.data[idx + 1];
  const b = this.bitmap.data[idx + 2];

  // Remove pixels escuros/pretos (threshold 40)
  if (r < 40 && g < 40 && b < 40) {
    this.bitmap.data[idx + 3] = 0;
  }
});

await img.write(output);
console.log("Fundo preto removido →", output);
