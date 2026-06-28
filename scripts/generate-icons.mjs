import sharp from "sharp";
import { readFileSync } from "fs";
import { join } from "path";

const svg = readFileSync(join(process.cwd(), "public", "icon.svg"));

for (const size of [192, 512]) {
  await sharp(svg).resize(size, size).png().toFile(join(process.cwd(), "public", `icon-${size}.png`));
  console.log(`Wrote public/icon-${size}.png`);
}
