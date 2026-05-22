// Footer easter-egg QR.
//
// The QR is a school of small "data" fish; the three finder corners and the
// version-5 alignment pattern are rendered as concentric rounded squares; and
// one big fish — silhouette of the easter-egg fish that swim across the
// bottom of the site — sits in the centre on its own light tile.
//
// With QR error-correction level H (30% recovery), modern phone cameras read
// the centre-fish overlay as a logo and recover the data behind it.
import { QR_MATRIX, QR_SIZE } from "@/data/qr-matrix";

const QUIET = 4;

// Small data fish: chunky body, sharp triangular forked tail (two clear
// triangles meeting at a deep notch), pointy dorsal-fin triangle. No eye —
// at module scale an eye is invisible and just adds visual noise.
const SMALL_FISH =
  "M24 52 a30 18 0 1 0 60 0 a30 18 0 1 0 -60 0 " +    // body
  "M24 52 L2 16 L16 52 L2 88 Z " +                     // forked triangle tail
  "M40 34 L54 8 L66 34 Z";                             // dorsal triangle

// Big centre fish — mirrors the easter-egg fish silhouette: longer thinner
// body, curvy forked tail with quadratic flukes, multi-peaked dorsal fin.
// All one colour, one path.
const BIG_FISH =
  "M20 50 a30 14 0 1 0 60 0 a30 14 0 1 0 -60 0 " +                  // body
  "M29 50 Q17 47 10 41 Q14 50 10 59 Q17 53 29 50 Z " +              // curvy tail
  "M38 38 Q42 28 47 31 Q51 22 54 31 Q58 29 62 40 Z";                // wavy dorsal

// Concentric rounded rectangles — the QR-standard 7×7 / 5×5 / 3×3 finder
// nesting, drawn as three rects instead of 49 modules. Rounded corners make
// them feel of-a-piece with the site's rounded cards.
function FinderPattern({ x, y }: { x: number; y: number }) {
  return (
    <g shapeRendering="geometricPrecision">
      <rect x={x}     y={y}     width={7} height={7} rx={1.2} fill="var(--qr-dark)" />
      <rect x={x + 1} y={y + 1} width={5} height={5} rx={0.9} fill="var(--qr-light)" />
      <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.6} fill="var(--qr-dark)" />
    </g>
  );
}

// Alignment pattern — 5×5 / 3×3 / 1×1 nesting. Same rounding language.
function AlignmentPattern({ x, y }: { x: number; y: number }) {
  return (
    <g shapeRendering="geometricPrecision">
      <rect x={x}     y={y}     width={5} height={5} rx={0.9} fill="var(--qr-dark)" />
      <rect x={x + 1} y={y + 1} width={3} height={3} rx={0.6} fill="var(--qr-light)" />
      <rect x={x + 2} y={y + 2} width={1} height={1} rx={0.25} fill="var(--qr-dark)" />
    </g>
  );
}

function isStructural(r: number, c: number): boolean {
  const n = QR_SIZE;
  const inFinder =
    (r < 7 && c < 7) ||
    (r < 7 && c >= n - 7) ||
    (r >= n - 7 && c < 7);
  const inAlignment = r >= 28 && r <= 32 && c >= 28 && c <= 32;
  return inFinder || inAlignment;
}

// A module is hidden by the centre fish tile and should be skipped — the QR
// error-correction recovers it.
function inCenterTile(r: number, c: number, centreR: number, centreC: number, halfW: number, halfH: number) {
  return r >= centreR - halfH && r <= centreR + halfH &&
         c >= centreC - halfW && c <= centreC + halfW;
}

export function FishQR({ ariaLabel = "QR code linking to Font Pond" }: {
  ariaLabel?: string;
}) {
  const n = QR_SIZE;
  const total = n + QUIET * 2;

  // Centre fish tile, in module-grid coordinates. Sized to hide ~5×3 modules
  // either side of centre (well under EC-H's 30% recovery budget).
  const centreR = Math.floor(n / 2);
  const centreC = Math.floor(n / 2);
  const halfW = 6;
  const halfH = 4;

  const fish: React.ReactNode[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (QR_MATRIX[r][c] !== "1") continue;
      if (isStructural(r, c)) continue;                                  // drawn as concentric rounded rects
      if (inCenterTile(r, c, centreR, centreC, halfW, halfH)) continue;  // hidden by the big-fish tile
      const x = c + QUIET;
      const y = r + QUIET;
      // Alternate fish direction by row for a school-of-fish feel.
      const flip = r % 2 === 1;
      const transform = flip
        ? `translate(${x + 1} ${y}) scale(-1 1)`
        : `translate(${x} ${y})`;
      fish.push(<use key={`f${r}-${c}`} href="#qrFishSmall" transform={transform} />);
    }
  }

  // Centre-fish tile geometry, in SVG (module) units.
  const tileW = (halfW * 2 + 1);   // a bit wider than the fish so it breathes
  const tileH = (halfH * 2 + 1);
  const tileX = centreC + QUIET - halfW;
  const tileY = centreR + QUIET - halfH;
  // Big fish drawn inside the tile, slightly inset.
  const bigInsetX = 1.2, bigInsetY = 1.2;
  const bigX = tileX + bigInsetX;
  const bigY = tileY + bigInsetY;
  const bigW = tileW - bigInsetX * 2;
  const bigH = tileH - bigInsetY * 2;

  return (
    <svg
      viewBox={`0 0 ${total} ${total}`}
      width="100%"
      height="auto"
      role="img"
      aria-label={ariaLabel}
      shapeRendering="geometricPrecision"
      style={{ display: "block", borderRadius: "12px" }}
    >
      <defs>
        <symbol id="qrFishSmall" viewBox="0 0 100 100" width="1" height="1">
          <path d={SMALL_FISH} />
        </symbol>
        <symbol id="qrFishBig" viewBox="0 0 100 100">
          <path d={BIG_FISH} />
        </symbol>
      </defs>

      {/* Background tile */}
      <rect width={total} height={total} fill="var(--qr-light)" />

      {/* Data modules — the school of fish */}
      <g fill="var(--qr-dark)">{fish}</g>

      {/* Finder corners + alignment pattern */}
      <FinderPattern x={QUIET}             y={QUIET} />
      <FinderPattern x={QUIET + n - 7}     y={QUIET} />
      <FinderPattern x={QUIET}             y={QUIET + n - 7} />
      <AlignmentPattern x={QUIET + 28}     y={QUIET + 28} />

      {/* Centre fish tile — a light "card" over the data modules, then the
          big easter-egg-silhouette fish on top. EC-H recovers the hidden
          data modules. */}
      <rect x={tileX} y={tileY} width={tileW} height={tileH} rx={1.4} fill="var(--qr-light)" />
      <use href="#qrFishBig" x={bigX} y={bigY} width={bigW} height={bigH} fill="var(--qr-dark)" />
    </svg>
  );
}
