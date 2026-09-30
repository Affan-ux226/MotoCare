const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal PNG encoder in pure Node.js
function createPNG(width, height, drawFn) {
  // RGBA buffer
  const rgba = Buffer.alloc(width * height * 4);
  drawFn(rgba, width, height);

  // Scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    scanlines[offset++] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      scanlines[offset++] = rgba[idx];     // R
      scanlines[offset++] = rgba[idx + 1]; // G
      scanlines[offset++] = rgba[idx + 2]; // B
      scanlines[offset++] = rgba[idx + 3]; // A
    }
  }

  const deflated = zlib.deflateSync(scanlines, { level: 9 });

  function crc32(buf) {
    let table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c >>> 0;
    }
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const toCrc = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(toCrc), 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdr = chunk('IHDR', ihdrData);
  const idat = chunk('IDAT', deflated);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function drawMotoIcon(rgba, width, height, isMaskable = false) {
  const cx = width / 2;
  const cy = height / 2;
  const scale = width / 512;

  // Fill Background
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (isMaskable) {
        // Deep modern dark gradient
        const t = y / height;
        rgba[idx] = Math.round(11 + t * 10);
        rgba[idx + 1] = Math.round(13 + t * 12);
        rgba[idx + 2] = Math.round(16 + t * 14);
        rgba[idx + 3] = 255;
      } else {
        // Rounded squircle
        const cornerR = 90 * scale;
        let inside = true;
        const dx = Math.abs(x - cx);
        const dy = Math.abs(y - cy);
        const half = (width / 2) - (8 * scale);

        if (dx > half - cornerR && dy > half - cornerR) {
          const cornerDist = Math.hypot(dx - (half - cornerR), dy - (half - cornerR));
          if (cornerDist > cornerR) inside = false;
        } else if (dx > half || dy > half) {
          inside = false;
        }

        if (inside) {
          const t = y / height;
          rgba[idx] = Math.round(11 + t * 10);
          rgba[idx + 1] = Math.round(13 + t * 12);
          rgba[idx + 2] = Math.round(16 + t * 14);
          rgba[idx + 3] = 255;
        } else {
          rgba[idx] = 0;
          rgba[idx + 1] = 0;
          rgba[idx + 2] = 0;
          rgba[idx + 3] = 0;
        }
      }
    }
  }

  // Draw Glowing Blue Circle Accent in center
  const glowR = 120 * scale;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (rgba[idx + 3] === 0) continue;
      const d = Math.hypot(x - cx, y - cy);
      if (d < glowR) {
        const factor = (1 - d / glowR) * 0.35;
        rgba[idx] = Math.min(255, Math.round(rgba[idx] + 22 * factor * 255));
        rgba[idx + 1] = Math.min(255, Math.round(rgba[idx + 1] + 119 * factor * 255));
        rgba[idx + 2] = Math.min(255, Math.round(rgba[idx + 2] + 255 * factor * 255));
      }
    }
  }

  // Helper to draw circle
  function fillCircle(centerPx, centerPy, r, color, strokeOnly = false, strokeWidth = 1) {
    for (let y = Math.floor(centerPy - r - strokeWidth); y <= Math.ceil(centerPy + r + strokeWidth); y++) {
      if (y < 0 || y >= height) continue;
      for (let x = Math.floor(centerPx - r - strokeWidth); x <= Math.ceil(centerPx + r + strokeWidth); x++) {
        if (x < 0 || x >= width) continue;
        const d = Math.hypot(x - centerPx, y - centerPy);
        const idx = (y * width + x) * 4;
        if (strokeOnly) {
          if (Math.abs(d - r) <= strokeWidth / 2) {
            rgba[idx] = color[0];
            rgba[idx + 1] = color[1];
            rgba[idx + 2] = color[2];
            rgba[idx + 3] = 255;
          }
        } else {
          if (d <= r) {
            rgba[idx] = color[0];
            rgba[idx + 1] = color[1];
            rgba[idx + 2] = color[2];
            rgba[idx + 3] = 255;
          }
        }
      }
    }
  }

  // Helper to draw line segment
  function drawLine(x0, y0, x1, y1, lineWidth, color) {
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.ceil(dist * 2);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const px = x0 + (x1 - x0) * t;
      const py = y0 + (y1 - y0) * t;
      fillCircle(px, py, lineWidth / 2, color);
    }
  }

  // Shift & scale motorbike coordinates into the center safe-zone
  const ox = cx - 180 * scale;
  const oy = cy - 60 * scale;

  // Back Wheel
  fillCircle(ox + 70 * scale, oy + 180 * scale, 38 * scale, [22, 119, 255], true, 12 * scale);
  fillCircle(ox + 70 * scale, oy + 180 * scale, 14 * scale, [96, 165, 250]);

  // Front Wheel
  fillCircle(ox + 290 * scale, oy + 180 * scale, 38 * scale, [22, 119, 255], true, 12 * scale);
  fillCircle(ox + 290 * scale, oy + 180 * scale, 14 * scale, [96, 165, 250]);

  // Frame lines
  drawLine(ox + 70 * scale, oy + 180 * scale, ox + 130 * scale, oy + 110 * scale, 10 * scale, [255, 255, 255]);
  drawLine(ox + 130 * scale, oy + 110 * scale, ox + 210 * scale, oy + 110 * scale, 10 * scale, [255, 255, 255]);
  drawLine(ox + 210 * scale, oy + 110 * scale, ox + 290 * scale, oy + 180 * scale, 10 * scale, [255, 255, 255]);
  drawLine(ox + 130 * scale, oy + 110 * scale, ox + 180 * scale, oy + 180 * scale, 8 * scale, [96, 165, 250]);
  drawLine(ox + 180 * scale, oy + 180 * scale, ox + 290 * scale, oy + 180 * scale, 8 * scale, [96, 165, 250]);

  // Fork & Handlebars
  drawLine(ox + 250 * scale, oy + 50 * scale, ox + 290 * scale, oy + 180 * scale, 10 * scale, [147, 197, 253]);
  drawLine(ox + 225 * scale, oy + 80 * scale, ox + 250 * scale, oy + 50 * scale, 9 * scale, [255, 255, 255]);

  // Fuel Tank Pill
  for (let tx = ox + 140 * scale; tx <= ox + 200 * scale; tx += scale) {
    fillCircle(tx, oy + 95 * scale, 14 * scale, [22, 119, 255]);
  }

  // Headlight spot
  fillCircle(ox + 265 * scale, oy + 70 * scale, 6 * scale, [248, 250, 252]);
}

const pubDir = path.resolve(__dirname, '..', 'public');
if (!fs.existsSync(pubDir)) {
  fs.mkdirSync(pubDir, { recursive: true });
}

// Generate PWA Icons
console.log('Generating PWA Icons...');
fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), createPNG(192, 192, (b, w, h) => drawMotoIcon(b, w, h, false)));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), createPNG(512, 512, (b, w, h) => drawMotoIcon(b, w, h, false)));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, (b, w, h) => drawMotoIcon(b, w, h, true)));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), createPNG(180, 180, (b, w, h) => drawMotoIcon(b, w, h, false)));
fs.writeFileSync(path.join(pubDir, 'favicon.ico'), createPNG(64, 64, (b, w, h) => drawMotoIcon(b, w, h, false)));
console.log('Icons generated successfully.');
