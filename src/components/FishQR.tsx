// Footer easter-egg QR — a school of fish, plus rounded concentric finders.
//
// Each data module is one fish, drawn once as a <symbol> and instanced via
// <use>. Finder corners and the version-5 alignment pattern are rendered as
// concentric rounded rectangles (7/5/3 and 5/3/1 nesting) in the same
// rounded language as the rest of the site.
import { QR_MATRIX, QR_SIZE } from "@/data/qr-matrix";

const QUIET = 4;

// Each fish nearly fills its 1×1 module cell. The tail attaches to the body
// across a tall stem (y 42 → y 62) instead of meeting at a single point, so
// each fluke is a broad triangle rather than a needle. The dorsal fin is a
// short, subtle bump — not the tall spike the previous pass had.
//
//   • Body:   ellipse, centre (52,52), rx 34 ry 24.
//   • Tail:   M(22,42) L(4,22) L(16,52) L(4,82) L(22,62) Z — wide-base
//             forked tail with two stocky triangular flukes meeting at a
//             notch at (16,52).
//   • Dorsal: M(40,28) L(50,14) L(60,28) Z — short dorsal-fin bump.
const SMALL_FISH =
  "M18 52 a34 24 0 1 0 68 0 a34 24 0 1 0 -68 0 " +     // body
  "M22 42 L4 22 L16 52 L4 82 L22 62 Z " +               // chunky forked tail
  "M40 28 L50 14 L60 28 Z";                             // short dorsal bump

function FinderPattern({ x, y }: { x: number; y: number }) {
  return (
    <g shapeRendering="geometricPrecision">
      <rect x={x}     y={y}     width={7} height={7} rx={1.2} fill="var(--qr-dark)" />
      <rect x={x + 1} y={y + 1} width={5} height={5} rx={0.9} fill="var(--qr-light)" />
      <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.6} fill="var(--qr-dark)" />
    </g>
  );
}

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

export function FishQR({ ariaLabel = "QR code linking to Font Pond" }: {
  ariaLabel?: string;
}) {
  const n = QR_SIZE;
  const total = n + QUIET * 2;

  const fish: React.ReactNode[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (QR_MATRIX[r][c] !== "1") continue;
      if (isStructural(r, c)) continue; // drawn as concentric rounded rects
      const x = c + QUIET;
      const y = r + QUIET;
      // Alternate fish direction by row for a school-of-fish feel.
      const flip = r % 2 === 1;
      const transform = flip
        ? `translate(${x + 1} ${y}) scale(-1 1)`
        : `translate(${x} ${y})`;
      fish.push(<use key={`f${r}-${c}`} href="#qrFish" transform={transform} />);
    }
  }

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
        <symbol id="qrFish" viewBox="0 0 100 100" width="1" height="1">
          <path d={SMALL_FISH} />
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
    </svg>
  );
}
