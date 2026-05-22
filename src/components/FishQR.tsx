// Footer easter-egg QR — modules rendered as a school of fish in the same
// family as the easter-egg fish that swim across the bottom of the site:
// chunky body, prominent forked tail, dorsal-fin bump, light eye.
//
// Finder corners and the version-5 alignment pattern stay as solid squares so
// the scanner still locks on; only the data modules become fish. With QR
// error-correction H (30% recovery), modern phone cameras read it fine.
//
// The component scales with its container — the modal sets the width — so
// "bigger fish" comes from rendering the same QR at a larger pixel size.
import { QR_MATRIX, QR_SIZE } from "@/data/qr-matrix";

const QUIET = 4;

// One fish, drawn once as an SVG <symbol> in a 100×100 box; every cell uses
// <use> to instance it. Beefier than the first pass — body fills more of the
// cell, the tail extends further, the dorsal fin is taller, and the eye is a
// real cut-out you can actually see.
//
//   • Body:    ellipse, center (54,54), rx 38 ry 28.
//   • Tail:    forked, tips at x=2 (top y=22, bottom y=86), notch at (18,54).
//   • Dorsal:  curved triangle from (38,30) up to (54,6) and back to (70,30).
//   • Eye:     light disc near the nose, r=7.
const FISH_BODY =
  "M16 54 a38 28 0 1 0 76 0 a38 28 0 1 0 -76 0 " +    // body
  "M22 54 L2 22 L18 54 L2 86 Z " +                     // forked tail
  "M38 30 Q54 6 70 30 Z";                              // dorsal fin

// Alignment pattern for version-5 QR is centered at (30, 30).
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
        // doesn't change the central dark coverage the scanner samples.
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
      width="100%"
      height="auto"
      role="img"
      aria-label={ariaLabel}
      shapeRendering="geometricPrecision"
      style={{ display: "block", borderRadius: "12px" }}
    >
      <defs>
        <symbol id="qrFish" viewBox="0 0 100 100" width="1" height="1">
          <path d={FISH_BODY} fill="var(--qr-dark)" />
          {/* Eye is filled with the QR background colour so it reads as a
              cut-out highlight, not a separate dot. */}
          <circle cx="78" cy="46" r="7" fill="var(--qr-light)" />
        </symbol>
      </defs>

      <rect width={total} height={total} fill="var(--qr-light)" />

      {/* Finder + alignment squares — pixel-aligned crisp for scanner lock */}
      <g fill="var(--qr-dark)" shapeRendering="crispEdges">
        {structural}
      </g>

      {/* Data modules — the school of fish */}
      <g>{fish}</g>
    </svg>
  );
}
