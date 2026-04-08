// Prebuild script: generates pair-slugs.json and font-slugs.json
// so generateStaticParams can read lightweight files instead of
// loading the entire pair generation pipeline

import { writeFileSync } from "fs";
import { execSync } from "child_process";

// Use tsx to evaluate the TypeScript data modules
const fontSlugs = execSync(
  `npx tsx -e "import { fonts } from './src/data/fonts'; console.log(JSON.stringify(fonts.map(f => f.slug)))"`,
  { maxBuffer: 50 * 1024 * 1024, cwd: process.cwd() }
).toString().trim();

const pairSlugs = execSync(
  `npx tsx -e "import { fontPairs } from './src/data/pairs'; console.log(JSON.stringify(fontPairs.map(p => p.slug)))"`,
  { maxBuffer: 50 * 1024 * 1024, cwd: process.cwd() }
).toString().trim();

writeFileSync("src/data/font-slugs.json", fontSlugs);
writeFileSync("src/data/pair-slugs.json", pairSlugs);

const fc = JSON.parse(fontSlugs).length;
const pc = JSON.parse(pairSlugs).length;
console.log(`Generated ${fc} font slugs and ${pc} pair slugs`);
