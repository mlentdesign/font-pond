import opentype from "opentype.js";
import fs from "fs";
import path from "path";
const CACHE_DIR = "/Users/eddy/developer/projects/Font Pond/.font-cache/dafont";

const filePath = fs.readdirSync(CACHE_DIR).map(f => path.join(CACHE_DIR, f)).find(f => f.includes("brusher"));
if (!filePath) { console.log("not cached - run measure-new-dafont.mjs first for brusher"); process.exit(1); }

const font = opentype.parse(fs.readFileSync(filePath).buffer);
const os2 = font.tables?.os2;

// xHeight
let xH = "moderate";
if (os2?.sxHeight && os2?.sCapHeight && os2.sCapHeight > 0) {
  const r = os2.sxHeight / os2.sCapHeight;
  xH = r < 0.62 ? "low" : r > 0.74 ? "high" : "moderate";
}

// strokeContrast
let sc = "low";
if (os2?.panose?.[3] >= 8) sc = "high";
else if (os2?.panose?.[3] >= 5) sc = "moderate";
else if (os2?.panose?.[3] < 3) sc = "none";

// letterSpacing  
let sp = "normal";
if (os2?.usWidthClass <= 3) sp = "tight";
else if (os2?.usWidthClass >= 7) sp = "generous";

// aperture
let ap = "moderate";
if (os2?.panose?.[6] >= 11) ap = "closed";
else if (os2?.panose?.[6] <= 4) ap = "open";

console.log(`brusher: xH=${xH}, ap=${ap}, sc=${sc}, sp=${sp}`);
console.log(`Mood: warm (script)`);
