// Footer easter-egg QR — modules rendered as little fish, in the same family
// as the easter-egg fish that swim across the bottom of the site (oval body,
// forked tail, dorsal-fin bump, a small eye).
//
// Finder corners and the version-5 alignment pattern stay as solid squares so
// the scanner still locks on; only the data modules become fish. With QR
// error-correction H (30% recovery), modern phone cameras read it fine.
import { QR_MATRIX, QR_SIZE } from "@/data/qr-matrix";

const QUIET = 4;

// One fish, drawn once as an SVG <symbol> in a 100×100 box; every cell uses
// <use> to instance it. Cheap, and one path to tweak if the shape ever changes.
//
//   • Body:    ellipse, center (54,54), rx 32 ry 22 — fills most of the cell.
//   • Tail:    forked, tips at x=4 (top y=28, bottom y=80), notch at (14,54).
//   • Dorsal:  curved triangle bump from (44,32) up to (56,12) and back.
//   • Eye:     small light disc near the front of the body so a fish reads as
//              a fish, not a generic blob.
const FISH_BODY =
  "M22 54 a32 22 0 1 0 64 0 a32 22 0 1 0 -64 0 " +    // body
  "M22 54 L4 28 L14 54 L4 80 Z " +                     // forked tail
  "M44 32 Q56 12 68 32 Z";                             // dorsal fin

// Alignment pattern center for version-5 QR codes lives at (30, 30).
function isStructural(r: number, c: number): boolean {
  const n = QR_SIZE;
  const inFinder =
    (r < 7 && c < 7) ||
    (r < 7 && c >= n - 7) ||
    (r >= n - 7 && c < 7);
  const inAlignment = r >= 28 && r <= 32 && c >= 28 && c <= 32;
  return inFinder || inAlignment;
}

export function FishQR({ px = 320, ariaLabel = "QR code linking to Font Pond" }: {
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
        // Alternate fish direction by row — a school-of-fish feel. Mirroring
        // doesn't change the central dark coverage that the scanner samples.
        const flip = r % 2 === 1;
        const transform = flip
          ? `translate(${x + 1} ${y}) scale(-1 1)`
          : `translate(${x} ${y})`;
        fish.push(<use key={`f${r}-${c}`} href="#qrFish" transform={transform} />);
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
      <defs>
        {/* One fish, sized to a unit cell via width/height on <use>. */}
        <symbol id="qrFish" viewBox="0 0 100 100" width="1" height="1">
          <path d={FISH_BODY} fill="var(--qr-dark)" />
          {/* Eye: a small disc in the QR background color so it reads as a
              cut-out highlight against the dark body. */}
          <circle cx="76" cy="46" r="5" fill="var(--qr-light)" />
        </symbol>
      </defs>

      {/* Background tile */}
      <rect width={total} height={total} fill="var(--qr-light)" />

      {/* Structural modules — pixel-aligned squares for crisp finders */}
      <g fill="var(--qr-dark)" shapeRendering="crispEdges">
        {structural}
      </g>

      {/* Data modules — the school of fish */}
      <g>{fish}</g>
    </svg>
  );
}
