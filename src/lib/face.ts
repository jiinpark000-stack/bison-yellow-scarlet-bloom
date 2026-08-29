export const FACE_SIZE = 32;
const LEGACY_SIZE = 24;
export const FACE_MATCH_MAX = 0.72;
const LEGACY_MATCH_MAX = 0.7;
export const FACE_STRICT_MAX = 0.14;
const COARSE_SIZE = 12;
const PACK_SIZES = [32 * 32, 40 * 40, 24 * 24, 16 * 16];

export function parseDescriptor(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  if (typeof value[0] !== "number" && typeof value[0] !== "string") return null;
  if (!PACK_SIZES.includes(value.length)) return null;
  const out: number[] = [];
  for (const item of value) {
    const n = typeof item === "number" ? item : Number(item);
    if (!Number.isFinite(n)) return null;
    out.push(n);
  }
  return out;
}

function unpackPacked(raw: unknown[]): number[][] {
  if (raw.length === 0 || (typeof raw[0] !== "number" && typeof raw[0] !== "string")) return [];
  const nums = raw.map((item) => (typeof item === "number" ? item : Number(item)));
  if (nums.some((n) => !Number.isFinite(n))) return [];
  const one = parseDescriptor(nums);
  if (one) return [one];
  for (const size of PACK_SIZES) {
    if (nums.length >= size && nums.length % size === 0) {
      const out: number[][] = [];
      for (let i = 0; i < nums.length; i += size) {
        const d = parseDescriptor(nums.slice(i, i + size));
        if (d) out.push(d);
      }
      if (out.length) return out;
    }
  }
  return [];
}

export function parseStoredDescriptors(value: unknown): number[][] {
  let raw: unknown = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw) || raw.length === 0) return [];
  const packed = unpackPacked(raw);
  if (packed.length) return packed;
  const out: number[][] = [];
  for (const item of raw) {
    if (!Array.isArray(item)) continue;
    const inner = unpackPacked(item);
    if (inner.length) out.push(...inner);
    else {
      const d = parseDescriptor(item);
      if (d) out.push(d);
    }
  }
  return out;
}

export function asFaceSamples(input: number[] | number[][]): number[][] {
  return parseStoredDescriptors(input);
}

export function packSamples(samples: number[][]): number[] {
  const parsed = asFaceSamples(samples);
  return parsed.length ? parsed.flat() : [];
}

export function asFaceTemplate(input: number[] | number[][]): number[] | null {
  const samples = asFaceSamples(input);
  if (samples.length === 0) return null;
  if (samples.length === 1) return samples[0];
  return averageDescriptors(samples);
}

function sizeOf(desc: number[]): number {
  return Math.round(Math.sqrt(desc.length));
}

function resizeSquare(desc: number[], to: number): number[] {
  const from = sizeOf(desc);
  if (from === to) return desc;
  const out: number[] = [];
  const scale = from / to;
  for (let y = 0; y < to; y += 1) {
    for (let x = 0; x < to; x += 1) {
      let sum = 0;
      let n = 0;
      const x0 = Math.floor(x * scale);
      const x1 = Math.max(x0 + 1, Math.ceil((x + 1) * scale));
      const y0 = Math.floor(y * scale);
      const y1 = Math.max(y0 + 1, Math.ceil((y + 1) * scale));
      for (let yy = y0; yy < y1 && yy < from; yy += 1) {
        for (let xx = x0; xx < x1 && xx < from; xx += 1) {
          sum += desc[yy * from + xx];
          n += 1;
        }
      }
      out.push(n ? sum / n : 0);
    }
  }
  return l2(out);
}

function l2(values: number[]): number[] {
  const mag = Math.sqrt(values.reduce((sum, n) => sum + n * n, 0)) || 1;
  return values.map((n) => n / mag);
}

function boxBlur(gray: number[], size: number): number[] {
  const out = new Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let sum = 0;
      let n = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        const yy = y + dy;
        if (yy < 0 || yy >= size) continue;
        for (let dx = -1; dx <= 1; dx += 1) {
          const xx = x + dx;
          if (xx < 0 || xx >= size) continue;
          sum += gray[yy * size + xx];
          n += 1;
        }
      }
      out[y * size + x] = sum / n;
    }
  }
  return out;
}

function qualityOrThrow(gray: number[]) {
  const mean = gray.reduce((sum, n) => sum + n, 0) / gray.length;
  const variance = gray.reduce((sum, n) => sum + (n - mean) ** 2, 0) / gray.length;
  if (mean < 3 || mean > 253) throw new Error("너무 어둡거나 밝아요. 창가·불을 향해 앉아 주세요.");
  if (variance < 6) throw new Error("타원 안에 얼굴을 더 가까이 맞춰 주세요.");
}

function radialWeights(size: number): number[] {
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;
  const rx = size * 0.38;
  const ry = size * 0.42;
  const out: number[] = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const r = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
      out.push(r >= 1 ? 0 : (1 - r) * (1 - r));
    }
  }
  return out;
}

function ellipseGray(data: ImageData): number[] {
  const size = data.width;
  const px = data.data;
  const gray: number[] = [];
  const mask: boolean[] = [];
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;
  const rx = size * 0.4;
  const ry = size * 0.44;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const g = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
      gray.push(Math.sqrt(Math.max(0, g) / 255) * 255);
      mask.push(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1);
    }
  }
  const inside = gray.filter((_, i) => mask[i]);
  const fill = inside.reduce((sum, n) => sum + n, 0) / (inside.length || 1);
  return boxBlur(
    gray.map((n, i) => (mask[i] ? n : fill)),
    size,
  );
}

export function descriptorFromImageData(data: ImageData): number[] {
  const gray = ellipseGray(data);
  const weights = radialWeights(data.width);
  const used = gray.filter((_, i) => weights[i] > 0.2);
  qualityOrThrow(used.length ? used : gray);
  let sum = 0;
  let wsum = 0;
  for (let i = 0; i < gray.length; i += 1) {
    if (weights[i] <= 0.15) continue;
    sum += gray[i] * weights[i];
    wsum += weights[i];
  }
  const mean = sum / (wsum || 1);
  let vsum = 0;
  for (let i = 0; i < gray.length; i += 1) {
    if (weights[i] <= 0.15) continue;
    vsum += weights[i] * (gray[i] - mean) ** 2;
  }
  const std = Math.sqrt(vsum / (wsum || 1)) || 1;
  return l2(gray.map((n, i) => (weights[i] * (n - mean)) / std)).map((n) => Math.round(n * 1e4) / 1e4);
}

export function faceDistance(a: number[], b: number[]): number {
  let left = a;
  let right = b;
  if (a.length !== b.length) {
    const to = Math.min(sizeOf(a), sizeOf(b));
    left = resizeSquare(a, to);
    right = resizeSquare(b, to);
  }
  if (left.length !== right.length) return 1;
  let dot = 0;
  for (let i = 0; i < left.length; i += 1) dot += left[i] * right[i];
  return 1 - dot;
}

export function faceMatchLimit(desc: number[], strict = false): number {
  if (strict) return FACE_STRICT_MAX;
  return desc.length === LEGACY_SIZE * LEGACY_SIZE ? LEGACY_MATCH_MAX : FACE_MATCH_MAX;
}

function mirrorDescriptor(desc: number[]): number[] {
  const size = sizeOf(desc);
  const out: number[] = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) out.push(desc[y * size + (size - 1 - x)]);
  }
  return l2(out);
}

export function combinedDistance(a: number[], b: number[]): number {
  const d8 = faceDistance(resizeSquare(a, 8), resizeSquare(b, 8));
  const d12 = faceDistance(resizeSquare(a, COARSE_SIZE), resizeSquare(b, COARSE_SIZE));
  const d16 = faceDistance(resizeSquare(a, 16), resizeSquare(b, 16));
  return Math.min(d8 * 1.08, d12, d16);
}

export function pairDistance(a: number[], b: number[]): number {
  return Math.min(combinedDistance(a, b), combinedDistance(a, mirrorDescriptor(b)));
}

export function facesMatch(a: number[], b: number[], strict = false): boolean {
  const score = pairDistance(a, b);
  return score <= (strict ? FACE_STRICT_MAX : faceMatchLimit(a));
}

export function prepareGallery(input: number[] | number[][]): number[][] {
  const samples = asFaceSamples(input);
  if (samples.length === 0) throw new Error("얼굴을 다시 찍어 주세요.");
  const avg = samples.length === 1 ? samples[0] : averageDescriptors(samples);
  const unique = [avg, mirrorDescriptor(avg)];
  for (const sample of samples) {
    if (unique.length >= 7) break;
    if (unique.some((item) => pairDistance(item, sample) < 0.03)) continue;
    unique.push(sample);
  }
  return unique;
}

export function bestGalleryScore(gallery: number[][], incoming: number[] | number[][]): number {
  const stored = gallery.filter((item) => item.length > 0);
  const samples = asFaceSamples(incoming);
  let best = 1;
  for (const sample of samples) {
    for (const item of stored) best = Math.min(best, pairDistance(item, sample));
  }
  return best;
}

export function matchGallery(gallery: number[][], incoming: number[] | number[][], strict = false): boolean {
  const stored = gallery.filter((item) => item.length > 0);
  const samples = asFaceSamples(incoming);
  if (stored.length === 0 || samples.length === 0) return false;
  const limit = strict ? FACE_STRICT_MAX : FACE_MATCH_MAX;
  return bestGalleryScore(stored, samples) <= limit;
}

function ovalBox(video: HTMLVideoElement, scale = 1, dx = 0, dy = 0): DOMRect {
  const w = video.videoWidth || 320;
  const h = video.videoHeight || 240;
  const side = Math.min(w, h);
  const ox = (w - side) / 2;
  const oy = (h - side) / 2;
  const bw = side * 0.58 * scale;
  const bh = side * 0.72 * scale;
  const cx = ox + side * 0.5 + dx * side;
  const cy = oy + side * 0.5 + dy * side;
  return new DOMRect(cx - bw / 2, cy - bh / 2, bw, bh);
}

export async function faceBox(video: HTMLVideoElement): Promise<DOMRect> {
  return ovalBox(video);
}

async function detectBox(video: HTMLVideoElement): Promise<DOMRect | null> {
  const Detector = (window as Window & { FaceDetector?: new (opts?: object) => { detect: (src: HTMLVideoElement) => Promise<{ boundingBox: DOMRectReadOnly }[]> } }).FaceDetector;
  if (!Detector) return null;
  try {
    const faces = await new Detector({ fastMode: true, maxDetectedFaces: 1 }).detect(video);
    const box = faces[0]?.boundingBox;
    if (!box || box.width < 40 || box.height < 40) return null;
    const pad = Math.max(box.width, box.height) * 0.08;
    return new DOMRect(box.x - pad, box.y - pad, box.width + pad * 2, box.height + pad * 2);
  } catch {
    return null;
  }
}

async function captureCrop(video: HTMLVideoElement, box: DOMRect): Promise<number[]> {
  if (video.readyState < 2 || !video.videoWidth) throw new Error("카메라가 아직 준비되지 않았어요.");
  const canvas = document.createElement("canvas");
  canvas.width = FACE_SIZE;
  canvas.height = FACE_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("얼굴을 담을 수 없어요.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(video, box.x, box.y, box.width, box.height, 0, 0, FACE_SIZE, FACE_SIZE);
  return descriptorFromImageData(ctx.getImageData(0, 0, FACE_SIZE, FACE_SIZE));
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function captureFaceSamples(video: HTMLVideoElement, count = 4): Promise<number[][]> {
  await wait(400);
  const samples: number[][] = [];
  let lastErr: Error | null = null;
  const crops = [
    () => ovalBox(video, 0.78),
    () => ovalBox(video, 0.86),
    () => ovalBox(video, 0.72),
    () => ovalBox(video, 0.8, 0.02, 0),
  ];
  for (let i = 0; i < Math.max(count, 4) + 6 && samples.length < Math.max(count, 4); i += 1) {
    if (i) await wait(70);
    try {
      samples.push(await captureCrop(video, crops[i % crops.length]()));
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error("얼굴을 담지 못했어요.");
    }
  }
  const detected = await detectBox(video);
  if (detected) {
    try {
      samples.push(await captureCrop(video, detected));
    } catch {
      /* oval samples are enough */
    }
  }
  if (samples.length === 0) throw lastErr ?? new Error("얼굴을 담지 못했어요.");
  return samples;
}

export function averageDescriptors(samples: number[][]): number[] {
  const parsed = samples.map(parseDescriptor).filter((d): d is number[] => Boolean(d));
  if (parsed.length === 0) throw new Error("얼굴을 다시 찍어 주세요.");
  const len = parsed[0].length;
  const acc = new Array(len).fill(0);
  let n = 0;
  for (const sample of parsed) {
    if (sample.length !== len) continue;
    for (let i = 0; i < len; i += 1) acc[i] += sample[i];
    n += 1;
  }
  if (!n) throw new Error("얼굴을 다시 찍어 주세요.");
  return l2(acc.map((v) => v / n));
}

export async function captureFaceDescriptor(video: HTMLVideoElement): Promise<number[]> {
  return averageDescriptors(await captureFaceSamples(video, 6));
}
