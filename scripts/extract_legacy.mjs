import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';

// Parse curriculumV2.ts to get legacySectionIdsByPartId
const v2Path = resolve('./src/data/core/curriculumV2.ts');
const v2Content = readFileSync(v2Path, 'utf8');

const regex = /legacySectionIdsByPartId: Record<string, string\[\]> = ({[\s\S]*?});/;
const match = v2Content.match(regex);
let idsToExtract = [];
if (match) {
  const objStr = match[1];
  const idsMatch = objStr.match(/"([^"]+)"/g);
  if (idsMatch) {
    // Filter out keys like "v2-part-1-math-foundations"
    idsToExtract = idsMatch.map(s => s.replace(/"/g, '')).filter(id => !id.startsWith('v2-part'));
  }
}

console.log('Extracting IDs:', idsToExtract.length);

// We have the TS file src/data/curriculum.ts
// We'll use ts-node or just esbuild to require it.
import { execSync } from 'child_process';

execSync('npx esbuild src/data/curriculum.ts --format=cjs --outfile=dist_curriculum.cjs');
const m = await import(resolve('./dist_curriculum.cjs'));
const { curriculum } = m.default || m;
(resolve('./dist_curriculum.cjs'));

const extractedSections = [];
for (const module of curriculum) {
  for (const section of module.sections) {
    if (idsToExtract.includes(section.id)) {
      extractedSections.push(section);
    }
  }
}

console.log('Found sections:', extractedSections.length);

if (!existsSync('./src/data/legacy')) {
  mkdirSync('./src/data/legacy', { recursive: true });
}

// Write them to src/data/legacy/legacySections.ts
const outPath = resolve('./src/data/legacy/legacySections.ts');
let outContent = `import type { LessonSection } from "../../types";\n\n`;
outContent += `export const legacySections: LessonSection[] = ${JSON.stringify(extractedSections, null, 2)};\n`;

writeFileSync(outPath, outContent, 'utf8');
console.log('Wrote legacySections.ts');
