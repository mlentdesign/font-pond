// Client-side image analysis: extracts dominant colors and maps to mood keywords
// Used to enhance font pair search when users upload reference images

interface ColorVibe {
  keywords: string[];
}

// Map HSL ranges to mood/style keywords
function hslToKeywords(h: number, s: number, l: number): string[] {
  const keywords: string[] = [];

  // Lightness-based
  if (l < 20) keywords.push("dark", "moody", "dramatic");
  else if (l < 35) keywords.push("rich", "deep", "bold");
  else if (l > 85) keywords.push("light", "airy", "minimal", "clean");
  else if (l > 70) keywords.push("soft", "gentle", "delicate");

  // Saturation-based
  if (s < 10) {
    keywords.push("neutral", "monochrome");
    if (l > 60) keywords.push("clean", "minimal");
    if (l < 30) keywords.push("sophisticated", "elegant");
  } else if (s < 25) {
    keywords.push("muted", "understated");
  } else if (s > 70) {
    keywords.push("vibrant", "bold", "energetic");
  }

  // Hue-based (only when saturated enough to matter)
  if (s > 15) {
    if (h < 15 || h > 345) keywords.push("warm", "passionate", "bold", "energetic");
    else if (h < 40) keywords.push("warm", "earthy", "rustic", "cozy", "natural");
    else if (h < 65) keywords.push("warm", "cheerful", "friendly", "playful", "sunny");
    else if (h < 90) keywords.push("fresh", "natural", "organic", "lively");
    else if (h < 150) keywords.push("natural", "fresh", "organic", "calm", "earthy");
    else if (h < 190) keywords.push("calm", "serene", "cool", "professional", "trustworthy");
    else if (h < 250) keywords.push("cool", "professional", "corporate", "trustworthy", "calm");
    else if (h < 290) keywords.push("creative", "luxurious", "mysterious", "elegant");
    else if (h < 330) keywords.push("feminine", "romantic", "playful", "soft");
    else keywords.push("bold", "energetic", "passionate");
  }

  return keywords;
}

// Analyze overall image characteristics
function analyzeColorDistribution(colors: { h: number; s: number; l: number }[]): string[] {
  const keywords: string[] = [];

  const avgL = colors.reduce((sum, c) => sum + c.l, 0) / colors.length;
  const avgS = colors.reduce((sum, c) => sum + c.s, 0) / colors.length;
  const lRange = Math.max(...colors.map(c => c.l)) - Math.min(...colors.map(c => c.l));

  // Contrast analysis
  if (lRange > 60) keywords.push("high-contrast", "dramatic", "bold");
  else if (lRange < 20) keywords.push("harmonious", "cohesive", "subtle");

  // Overall mood
  if (avgL > 65 && avgS < 30) keywords.push("minimalist", "clean", "modern");
  if (avgL < 35 && avgS < 30) keywords.push("dark", "moody", "sophisticated");
  if (avgS > 50 && avgL > 40 && avgL < 70) keywords.push("vibrant", "energetic", "playful");
  if (avgS < 20) keywords.push("monochromatic", "restrained", "elegant");

  // Warm vs cool
  const warmCount = colors.filter(c => c.h < 60 || c.h > 300).length;
  const coolCount = colors.filter(c => c.h >= 150 && c.h <= 270).length;
  if (warmCount > coolCount * 2) keywords.push("warm", "inviting", "cozy");
  if (coolCount > warmCount * 2) keywords.push("cool", "calm", "professional");

  // Earth tones detection
  const earthyCount = colors.filter(c => c.h >= 15 && c.h <= 50 && c.s >= 15 && c.s <= 60 && c.l >= 20 && c.l <= 60).length;
  if (earthyCount >= 2) keywords.push("earthy", "natural", "organic", "rustic");

  // Pastel detection
  const pastelCount = colors.filter(c => c.s >= 20 && c.s <= 50 && c.l >= 60 && c.l <= 85).length;
  if (pastelCount >= 2) keywords.push("pastel", "soft", "gentle", "delicate");

  return keywords;
}

// Texture / edge-density — how visually busy the image is.
// A brutalist concrete photo is dense with edges; a soft studio portrait is smooth.
// Color alone can't tell these apart, so we measure luminance change between
// neighbouring pixels across the downsampled grid.
function analyzeTexture(data: Uint8ClampedArray, size: number): string[] {
  const lum = (idx: number) => 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  let totalGradient = 0;
  let count = 0;
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const i = (y * size + x) * 4;
      const right = (y * size + x + 1) * 4;
      const down = ((y + 1) * size + x) * 4;
      totalGradient += Math.abs(lum(i) - lum(right)) + Math.abs(lum(i) - lum(down));
      count++;
    }
  }
  const avg = count > 0 ? totalGradient / count : 0; // ~0 (flat) to ~255 (very busy)

  const keywords: string[] = [];
  if (avg > 30) keywords.push("energetic", "bold", "rugged", "raw", "dynamic", "expressive");
  else if (avg > 14) keywords.push("textured", "expressive", "lively");
  else if (avg < 6) keywords.push("minimal", "clean", "calm", "soft", "refined", "elegant");
  else keywords.push("gentle", "calm");
  return keywords;
}

// Color-harmony — how the dominant hues relate to each other.
// Hues clustered close together read as cohesive/elegant; hues spread far
// apart read as vibrant and high-energy. This is the relationship between
// colors, which raw per-color hue mapping misses.
function analyzeColorHarmony(colors: { h: number; s: number; l: number }[]): string[] {
  const hues = colors.filter((c) => c.s > 12).map((c) => c.h);
  if (hues.length < 2) return ["monochrome", "cohesive", "minimal"];

  // Largest circular gap between any two dominant hues (0–180°).
  let maxSpread = 0;
  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) {
      const raw = Math.abs(hues[i] - hues[j]);
      const circular = Math.min(raw, 360 - raw);
      if (circular > maxSpread) maxSpread = circular;
    }
  }

  if (maxSpread < 40) return ["cohesive", "harmonious", "elegant", "sophisticated", "refined", "minimal"];
  if (maxSpread > 140) return ["vibrant", "bold", "playful", "energetic", "dynamic"];
  return ["balanced", "versatile"];
}

// Brightness histogram shape — where the image's tones sit.
// High-key (mass in the lights) reads airy; low-key (mass in the darks) reads
// moody; tones split at both ends read as dramatic high-contrast.
function analyzeBrightnessHistogram(colors: { h: number; s: number; l: number }[]): string[] {
  if (colors.length === 0) return [];
  const bins = [0, 0, 0, 0, 0]; // lightness 0–20, 20–40, 40–60, 60–80, 80–100
  for (const c of colors) bins[Math.min(4, Math.floor(c.l / 20))]++;
  const lowMass = (bins[0] + bins[1]) / colors.length;
  const highMass = (bins[3] + bins[4]) / colors.length;

  if (highMass > 0.6) return ["light", "airy", "bright", "clean", "minimal"];
  if (lowMass > 0.6) return ["dark", "moody", "dramatic", "bold"];
  if (lowMass > 0.3 && highMass > 0.3) return ["high-contrast", "dramatic", "bold", "editorial"];
  return ["even", "balanced"];
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Analyze an image file and return mood/style keywords.
 * Uses a canvas to sample colors and derive vibes.
 */
export async function analyzeImage(file: File): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 64; // downsample for speed
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve([]); return; }

      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      // Sample pixels evenly across the image
      const sampleCount = 200;
      const step = Math.max(1, Math.floor((size * size) / sampleCount));
      const sampledColors: { h: number; s: number; l: number }[] = [];

      for (let i = 0; i < size * size; i += step) {
        const idx = i * 4;
        const hsl = rgbToHsl(data[idx], data[idx + 1], data[idx + 2]);
        sampledColors.push(hsl);
      }

      // Cluster into dominant colors (simple: group by hue buckets)
      const buckets = new Map<number, { h: number; s: number; l: number }[]>();
      for (const c of sampledColors) {
        const bucket = Math.round(c.h / 30) * 30;
        if (!buckets.has(bucket)) buckets.set(bucket, []);
        buckets.get(bucket)!.push(c);
      }

      // Get top 5 color clusters by frequency
      const sorted = [...buckets.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 5);
      const dominantColors = sorted.map(([, colors]) => {
        const avgH = colors.reduce((s, c) => s + c.h, 0) / colors.length;
        const avgS = colors.reduce((s, c) => s + c.s, 0) / colors.length;
        const avgL = colors.reduce((s, c) => s + c.l, 0) / colors.length;
        return { h: avgH, s: avgS, l: avgL };
      });

      // Collect keywords from individual colors and overall distribution
      const allKeywords: string[] = [];
      for (const c of dominantColors) {
        allKeywords.push(...hslToKeywords(c.h, c.s, c.l));
      }
      allKeywords.push(...analyzeColorDistribution(dominantColors));
      // Non-color signals: texture/busyness, hue harmony, tonal range
      allKeywords.push(...analyzeTexture(data, size));
      allKeywords.push(...analyzeColorHarmony(dominantColors));
      allKeywords.push(...analyzeBrightnessHistogram(sampledColors));

      // Deduplicate and return top keywords (most frequently occurring = strongest signal)
      const counts = new Map<string, number>();
      for (const k of allKeywords) counts.set(k, (counts.get(k) || 0) + 1);
      const unique = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);

      // 10 (not 8) so texture/harmony/tone signals aren't crowded out by color
      resolve(unique.slice(0, 10));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve([]);
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Analyze multiple images and combine their keywords.
 */
export async function analyzeImages(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];
  const results = await Promise.all(files.map(analyzeImage));
  const counts = new Map<string, number>();
  for (const keywords of results) {
    for (const k of keywords) counts.set(k, (counts.get(k) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k).slice(0, 10);
}
