import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const appPath = resolve('./src/App.tsx');
let content = readFileSync(appPath, 'utf8');

// 1. Add imports
content = content.replace('import { useLocalStorage } from "./hooks/useLocalStorage";',
  'import { ProgressProvider, useProgress } from "./contexts/ProgressContext";\nimport { useLocalStorage } from "./hooks/useLocalStorage";');

// 2. Change function App() to function AppContent()
content = content.replace('function App() {', 'function AppContent() {');

// 3. Replace useLocalStorage with useProgress
content = content.replace(
  'const [progress, setProgress] = useLocalStorage<ProgressState>(storageKey, emptyProgress);',
  'const { progress, isLoaded, logStudy, toggleSection, toggleChecklist, saveUserCode, saveQuizAnswer, resetQuizAnswers, saveQuizScore, saveNote, updateSrsCard, recordWrongAnswers, clearWrongAnswers, resetProgress } = useProgress();\n\n  if (!isLoaded) return <div className="app-shell" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>데이터 불러오는 중...</div>;'
);

// 4. Remove all the state management callbacks from AppContent
// They start from `const logStudy =` and end before `const navigateToFirstMatch =`
const startStr = 'const logStudy = useCallback((sectionId: string, durationMs = 0) => {';
const endStr = 'const navigateToFirstMatch = useCallback(';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.slice(0, startIndex) + content.slice(endIndex);
}

// 5. Append default export App at the end
// Find `export default App;` and replace it
content = content.replace('export default App;', 'export default function App() {\n  return (\n    <ProgressProvider>\n      <AppContent />\n    </ProgressProvider>\n  );\n}');

writeFileSync(appPath, content, 'utf8');
