// Footer easter-egg QR — a school of fish, plus rounded concentric finders.
//
// Each data module is one fish, drawn once as a <symbol> and instanced via
// <use>. Finder corners and the version-5 alignment pattern are rendered as
// concentric rounded rectangles (7/5/3 and 5/3/1 nesting) in the same
// rounded language as the rest of the site.
import { QR_MATRIX, QR_SIZE } from "@/data/qr-matrix";

const QUIET = 4;

// Each fish nearly fills its 1×1 module cell. The tail is now much fatter:
// the notch is pushed deep toward the body (x=18) so each fluke is a chunky
// triangle ~2× the area of the previous pass, and the stem attaches across a
// wide y 28 → y 72 span. Tips stay sharp (pointed flukes are what reads as
// "fish"), but the body of each fluke is solid, not a needle.
//
//   • Body:   ellipse, centre (50,50), rx 40 ry 28.
//   • Tail:   M(22,28) L(2,4) L(18,50) L(2,96) L(22,72) Z — fat forked
//             tail, sharp tips, deep notch.
//   • Dorsal: M(38,22) L(50,10) L(62,22) Z — short dorsal-fin bump.
const SMALL_FISH =
  "M10 50 a40 28 0 1 0 80 0 a40 28 0 1 0 -80 0 " +     // body
  "M22 28 L2 4 L18 50 L2 96 L22 72 Z " +                // fat forked tail
  "M38 22 L50 10 L62 22 Z";                             // short dorsal bump

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
