import { deflateSync, inflateSync } from "node:zlib";
import { ORB_RACERS } from "../src/orb-race.js";

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const THUMBNAIL_SIZE = 1280;
const BACKGROUND = Object.freeze([236, 239, 243, 255]);
const OUTLINE = Object.freeze([17, 24, 39, 255]);

// 5x7 glyphs, rows of five bits. Enough to mark each entrant without a font file.
const GLYPHS = Object.freeze({
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
    "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
    "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
    A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
    D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
    H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
    J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
    K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
    R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
    X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
    Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
});

export function tournamentThumbnailLayout({ count, size = THUMBNAIL_SIZE } = {}) {
    const total = Math.max(0, Math.floor(Number(count) || 0));
    const columns = Math.max(1, Math.ceil(Math.sqrt(total)));
    const rows = Math.max(1, Math.ceil(total / columns));
    const margin = Math.round(size * 0.05);
    const cellWidth = (size - margin * 2) / columns;
    const cellHeight = (size - margin * 2) / rows;
    const cells = Array.from({ length: total }, (_, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        return {
            column,
            row,
            cx: margin + cellWidth * column + cellWidth / 2,
            cy: margin + cellHeight * row + cellHeight / 2,
            radius: Math.min(cellWidth, cellHeight) * 0.36,
        };
    });
    return { size, columns, rows, margin, cells };
}

export function renderTournamentOrbThumbnail({ orbIds, size = THUMBNAIL_SIZE } = {}) {
    const ids = Array.isArray(orbIds) ? [...orbIds] : [];
    if (!ids.length) throw new Error("Tournament thumbnail requires at least one entrant.");
    const unknown = ids.find((id) => !ORB_RACERS[id]);
    if (unknown) throw new Error(`Tournament thumbnail has an unknown orb: ${unknown}.`);
    const width = Math.max(64, Math.floor(Number(size) || THUMBNAIL_SIZE));
    const height = width;
    const pixels = new Uint8Array(width * height * 4);
    fillRect(pixels, BACKGROUND);
    const layout = tournamentThumbnailLayout({ count: ids.length, size: width });
    ids.forEach((id, index) => {
        const orb = ORB_RACERS[id];
        const cell = layout.cells[index];
        const fill = parseHexColor(orb.color);
        const accent = parseHexColor(orb.accent);
        drawDisc(pixels, width, height, cell.cx, cell.cy, cell.radius + 3, OUTLINE);
        drawDisc(pixels, width, height, cell.cx, cell.cy, cell.radius, accent);
        drawDisc(pixels, width, height, cell.cx, cell.cy, cell.radius * 0.78, fill);
        drawGlyph(pixels, width, height, cell.cx, cell.cy, cell.radius * 0.46, glyphFor(orb.name), glyphInk(fill));
    });
    const png = encodePng(pixels, width, height);
    if (png.length > 2 * 1024 * 1024) {
        throw new Error("Tournament thumbnail exceeds YouTube's 2MB limit.");
    }
    return png;
}

export function decodeThumbnailPng(png) {
    const buffer = Buffer.isBuffer(png) ? png : Buffer.from(png);
    if (buffer.length < 8 || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
        throw new Error("Tournament thumbnail is not a PNG.");
    }
    let offset = 8;
    let width = 0;
    let height = 0;
    const idat = [];
    while (offset + 8 <= buffer.length) {
        const length = buffer.readUInt32BE(offset);
        const type = buffer.toString("ascii", offset + 4, offset + 8);
        const data = buffer.subarray(offset + 8, offset + 8 + length);
        offset += 12 + length;
        if (type === "IHDR") {
            width = data.readUInt32BE(0);
            height = data.readUInt32BE(4);
        } else if (type === "IDAT") {
            idat.push(data);
        } else if (type === "IEND") {
            break;
        }
    }
    const inflated = inflateSync(Buffer.concat(idat));
    const rgba = new Uint8Array(width * height * 4);
    const stride = width * 4;
    for (let y = 0; y < height; y += 1) {
        const filter = inflated[y * (stride + 1)];
        if (filter !== 0) throw new Error("Tournament thumbnail PNG uses an unexpected row filter.");
        rgba.set(inflated.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride), y * stride);
    }
    return { width, height, rgba };
}

export function thumbnailPixel(decoded, x, y) {
    const px = Math.round(x);
    const py = Math.round(y);
    const index = (py * decoded.width + px) * 4;
    return [decoded.rgba[index], decoded.rgba[index + 1], decoded.rgba[index + 2], decoded.rgba[index + 3]];
}

function glyphFor(name) {
    const match = String(name || "").toUpperCase().match(/[A-Z0-9]/);
    return match ? GLYPHS[match[0]] : null;
}

function glyphInk(fill) {
    const luminance = (0.2126 * fill[0]) + (0.7152 * fill[1]) + (0.0722 * fill[2]);
    return luminance > 150 ? [17, 24, 39, 255] : [255, 255, 255, 255];
}

function parseHexColor(value) {
    const match = String(value || "").match(/^#([0-9a-f]{6})$/i);
    if (!match) return [120, 120, 120, 255];
    const hex = match[1];
    return [
        Number.parseInt(hex.slice(0, 2), 16),
        Number.parseInt(hex.slice(2, 4), 16),
        Number.parseInt(hex.slice(4, 6), 16),
        255,
    ];
}

function fillRect(pixels, color) {
    for (let index = 0; index < pixels.length; index += 4) {
        pixels[index] = color[0];
        pixels[index + 1] = color[1];
        pixels[index + 2] = color[2];
        pixels[index + 3] = color[3];
    }
}

function drawDisc(pixels, width, height, cx, cy, radius, color) {
    const r = Math.max(0, radius);
    const minX = Math.max(0, Math.floor(cx - r));
    const maxX = Math.min(width - 1, Math.ceil(cx + r));
    const minY = Math.max(0, Math.floor(cy - r));
    const maxY = Math.min(height - 1, Math.ceil(cy + r));
    const r2 = r * r;
    for (let y = minY; y <= maxY; y += 1) {
        const dy = y + 0.5 - cy;
        for (let x = minX; x <= maxX; x += 1) {
            const dx = x + 0.5 - cx;
            if ((dx * dx) + (dy * dy) > r2) continue;
            const index = (y * width + x) * 4;
            pixels[index] = color[0];
            pixels[index + 1] = color[1];
            pixels[index + 2] = color[2];
            pixels[index + 3] = color[3];
        }
    }
}

function drawGlyph(pixels, width, height, cx, cy, radius, rows, color) {
    if (!rows || radius < 4) return;
    const scale = Math.max(1, Math.floor((radius * 2) / 7));
    const glyphWidth = 5 * scale;
    const glyphHeight = 7 * scale;
    const originX = Math.round(cx - glyphWidth / 2);
    const originY = Math.round(cy - glyphHeight / 2);
    rows.forEach((row, rowIndex) => {
        for (let column = 0; column < 5; column += 1) {
            if (row[column] !== "1") continue;
            for (let dy = 0; dy < scale; dy += 1) {
                const y = originY + rowIndex * scale + dy;
                if (y < 0 || y >= height) continue;
                for (let dx = 0; dx < scale; dx += 1) {
                    const x = originX + column * scale + dx;
                    if (x < 0 || x >= width) continue;
                    const index = (y * width + x) * 4;
                    pixels[index] = color[0];
                    pixels[index + 1] = color[1];
                    pixels[index + 2] = color[2];
                    pixels[index + 3] = color[3];
                }
            }
        }
    });
}

function encodePng(pixels, width, height) {
    const stride = width * 4;
    const raw = Buffer.alloc((stride + 1) * height);
    for (let y = 0; y < height; y += 1) {
        const row = y * (stride + 1);
        raw[row] = 0;
        Buffer.from(pixels.buffer, pixels.byteOffset + y * stride, stride).copy(raw, row + 1);
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;
    return Buffer.concat([
        PNG_SIGNATURE,
        pngChunk("IHDR", ihdr),
        pngChunk("IDAT", deflateSync(raw, { level: 9 })),
        pngChunk("IEND", Buffer.alloc(0)),
    ]);
}

function pngChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body), 0);
    return Buffer.concat([length, body, crc]);
}

function crc32(buffer) {
    let crc = 0xffffffff;
    for (const byte of buffer) {
        crc ^= byte;
        for (let bit = 0; bit < 8; bit += 1) {
            const mask = -(crc & 1);
            crc = (crc >>> 1) ^ (0xedb88320 & mask);
        }
    }
    return (crc ^ 0xffffffff) >>> 0;
}
