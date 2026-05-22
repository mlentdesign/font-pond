// Renders the footer easter-egg QR code as a school of little fish.
// Finder and alignment patterns stay as solid rectangles so detection still
// locks on; the rest of the dark modules are fish silhouettes. Combined with
// the matrix's H-level (30%) error correction, modern phone cameras read it
// fine. Colors come from CSS variables so it themes automatically.
import { QR_MATRIX, QR_SIZE } from "@/data/qr-matrix";

// 4-module quiet zone is the QR spec minimum.
const QUIET = 4;

// One unit-cell fish silhouette pointing right: ellipse body + forked tail.
// Covers the cell center solidly (where scanners sample) so swapping squares
// for fish doesn't break detection.
const FISH_PATH =
  "M0.26,0.5 a0.30,0.26 0 1,0 0.60,0 a0.30,0.26 0 1,0 -0.60,0 " +
  "M0.32,0.50 L0.04,0.30 L0.13,0.50 L0.04,0.70 Z";

// Version-5 (37×37) QR codes have one alignment pattern centered at (30, 30).
// Keep its 5×5 region solid alongside the three corner finders.
function isStructural(r: number, c: number): boolean {
  const n = QR_SIZE;
  const inFinder =
    (r < 7 && c < 7) ||
    (r < 7 && c >= n - 7) ||
    (r >= n - 7 && c < 7);
  const inAlignment = r >= 28 && r <= 32 && c >= 28 && c <= 32;
  return inFinder || inAlignment;
}

export function FishQR({ px = 260, ariaLabel = "QR code linking to Font Pond" }: {
  px?: number;
  ariaLabel?: string;
}) {
  const n = QR_SIZE;
  const total = n + QUIET * 2;

  const structural: React.ReactNode[] = [];
  const fish: React.ReactNode[] = [];

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (QR_MATRIX[r][c] !== "1") continue;
      const x = c + QUIET;
      const y = r + QUIET;
      if (isStructural(r, c)) {
        structural.push(<rect key={`s${r}-${c}`} x={x} y={y} width={1} height={1} />);
      } else {
        // Alternate fish direction by row for a school-of-fish feel; mirroring
        // doesn't change cell-center coverage so it stays scannable.
        const flip = r % 2 === 1;
        const transform = flip
          ? `translate(${x + 1},${y}) scale(-1,1)`
          : `translate(${x},${y})`;
        fish.push(<path key={`f${r}-${c}`} d={FISH_PATH} transform={transform} />);
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${total} ${total}`}
      width={px}
      height={px}
      role="img"
      aria-label={ariaLabel}
      shapeRendering="geometricPrecision"
      style={{ display: "block", borderRadius: "12px" }}
    >
      <rect width={total} height={total} fill="var(--qr-light)" />
      <g fill="var(--qr-dark)">
        {structural}
        {fish}
      </g>
    </svg>
  );
}
