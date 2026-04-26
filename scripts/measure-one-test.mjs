import opentype from "opentype.js";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
const CACHE_DIR = "/Users/eddy/developer/projects/Font Pond/.font-cache/dafont";

async function download(slug) {
  const res = await fetch(`https://dl.dafont.com/dl/?f=${slug}`, { redirect: "follow" });
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf[0] !== 0x50 || buf[1] !== 0x4B) return null;
  const zipPath = path.join(CACHE_DIR, `${slug}.zip`);
  fs.writeFileSync(zipPath, buf);
  const extractDir = path.join(CACHE_DIR, `${slug}_extract`);
  if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true });
  fs.mkdirSync(extractDir, { recursive: true });
  execSync(`unzip -o -j "${zipPath}" -d "${extractDir}" 2>/dev/null`, { stdio: "pipe" });
  const files = fs.readdirSync(extractDir).filter(f => f.match(/\.(ttf|otf)$/i) && !f.startsWith("._"));
  if (!files.length) return null;
  const regular = files.find(f => /regular/i.test(f)) || files.find(f => !/bold|italic|light|thin/i.test(f)) || files[0];
  const ext = regular.toLowerCase().endsWith(".otf") ? ".otf" : ".ttf";
  const dest = path.join(CACHE_DIR, `${slug}${ext}`);
  fs.copyFileSync(path.join(extractDir, regular), dest);
  fs.rmSync(extractDir, {recursive:true}); fs.unlinkSync(zipPath);
  return dest;
}

for (const slug of ["chunkfive_ex", "brusher"]) {
  try {
    const p = await download(slug);
    if (!p) { console.log(slug + ": download failed"); continue; }
    const font = opentype.parse(fs.readFileSync(p).buffer);
    console.log(slug + ": OK - " + (font.names.fullName?.en || "unknown"));
  } catch(e) { console.log(slug + ": FAIL - " + e.message.substring(0, 80)); }
}
