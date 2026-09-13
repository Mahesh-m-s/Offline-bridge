const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 calculation table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generatePng(size, title) {
  const width = size;
  const height = size;

  // Raw image data: filter byte (0) + width * 4 bytes per scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const center = size / 2;
  const radius = size * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gradient background: Teal-900 to Emerald-700
      let r = 15;
      let g = 118;
      let b = 110;
      let a = 255;

      // Rounded circle badge
      if (dist <= radius) {
        // Deep emerald badge
        const factor = y / height;
        r = Math.floor(13 * (1 - factor) + 16 * factor);
        g = Math.floor(148 * (1 - factor) + 185 * factor);
        b = Math.floor(136 * (1 - factor) + 129 * factor);

        // Center emblem (Bridge & Signal arch)
        const archY = center + size * 0.05;
        const archDist = Math.abs(dy - size * 0.05);
        if (Math.abs(dx) < size * 0.28 && Math.abs(dy) < size * 0.25) {
          // Inner bridge beam
          if (y > archY - size * 0.04 && y < archY + size * 0.04) {
            r = 240; g = 253; b = 250;
          }
          // Bridge pillars
          if ((Math.abs(dx - size * 0.15) < size * 0.03 || Math.abs(dx + size * 0.15) < size * 0.03) && y >= archY) {
            r = 240; g = 253; b = 250;
          }
          // Signal arches
          const signalRadius = Math.sqrt(dx * dx + (dy + size * 0.1) * (dy + size * 0.1));
          if ((signalRadius > size * 0.15 && signalRadius < size * 0.19) ||
              (signalRadius > size * 0.24 && signalRadius < size * 0.28)) {
            if (dy < -size * 0.05) {
              r = 254; g = 240; b = 138; // Bright amber gold signal
            }
          }
        }
      } else {
        // Transparent corner for maskable rounded icon
        r = 15; g = 118; b = 110; a = 255;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', zlib.deflateSync(rawData));
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), generatePng(192, 'OfflineBridge'));
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), generatePng(512, 'OfflineBridge'));
console.log('Successfully generated icon-192x192.png and icon-512x512.png');
