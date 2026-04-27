import { useEffect, useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { cpp as cppLanguage } from "@codemirror/lang-cpp";
import { python as pythonLanguage } from "@codemirror/lang-python";
import { CheckCircle2, ClipboardCheck, Download, Eye, RotateCcw, Terminal, XCircle } from "lucide-react";
import { CodeLabBlock } from "./CodeLabBlock";
import { ExecutableLab } from "./ExecutableLab";
import { exportRos2Workspace } from "../utils/exportPkg";
import type { LessonSection, PracticeBlock } from "../types";

type PracticePanelProps = {
  section: LessonSection;
  savedCode: Record<string, string>;
  onSaveCode: (language: PracticeKind, code: string) => void;
};

type PracticeKind = "cpp" | "python";

const coreTokens = (block: PracticeBlock, language: PracticeKind) => {
  const text = `${block.goal} ${block.solutionCode ?? block.code}`.toLowerCase();
  const tokens = new Set<string>();
  if (language === "cpp") tokens.add("return");
  if (language === "python") tokens.add("print");
  ["cos", "sin", "jacobian", "eigen", "priority_queue", "resize", "precision", "recall", "csv", "state", "theta", "yaw"].forEach(
    (token) => {
      if (text.includes(token)) tokens.add(token);
    },
  );
  return [...tokens].slice(0, 5);
};

function PracticeBlockView({
  block,
  language,
  code,
  onChange,
  onExport,
}: {
  block: PracticeBlock;
  language: PracticeKind;
  code: string;
  onChange: (code: string) => void;
  onExport: () => void;
}) {
  const [showSolution, setShowSolution] = useState(false);
  const examples = useMemo(() => block.examples?.filter((example) => example.language === language) ?? [], [block.examples, language]);
  const [selectedExampleId, setSelectedExampleId] = useState(() => examples[0]?.id ?? "base");
  const selectedExample = examples.find((example) => example.id === selectedExampleId) ?? examples[0];
  const displayedCode = selectedExample?.starterCode ?? block.starterCode ?? block.code;
  const displayedSolution = selectedExample?.solutionCode ?? block.solutionCode ?? block.code;
  const displayedGoal = selectedExample ? `${block.goal} · ${selectedExample.title}` : block.goal;
  const requiredTokens = selectedExample?.checks ?? coreTokens(block, language);

  useEffect(() => {
    setSelectedExampleId(examples[0]?.id ?? "base");
    setShowSolution(false);
  }, [examples, language]);

  const checks = [
    { label: "코드를 직접 입력함", passed: code.trim().length > 20 },
    ...requiredTokens.map((token) => ({ label: `핵심 토큰 포함: ${token}`, passed: code.toLowerCase().includes(token.toLowerCase()) })),
  ];
  const passedCount = checks.filter((check) => check.passed).length;
  const extensions = language === "cpp" ? [cppLanguage()] : [pythonLanguage()];

  return (
    <div className="practice-block">
      <div className="practice-meta">
        <strong>{displayedGoal}</strong>
        <span>{block.expected}</span>
      </div>
      {examples.length > 0 && (
        <div className="practice-example-picker">
          {examples.map((example) => (
            <button
              className={selectedExample?.id === example.id ? "is-active" : ""}
              key={example.id}
              onClick={() => {
                setSelectedExampleId(example.id);
                onChange(example.starterCode);
                setShowSolution(false);
              }}
              type="button"
            >
              <strong>{example.title}</strong>
              <small>{example.explanation}</small>
            </button>
          ))}
        </div>
      )}
      <div className="parameter-table" aria-label={`${language} 실습 파라미터`}>
        <div className="parameter-row header">
          <span>입력</span>
          <span>기본값</span>
          <span>단위</span>
          <span>설명</span>
        </div>
        {block.parameters.map((parameter) => (
          <div className="parameter-row" key={`${parameter.name}-${parameter.defaultValue}`}>
            <span>{parameter.name}</span>
            <span>{parameter.defaultValue}</span>
            <span>{parameter.unit}</span>
            <span>{parameter.description}</span>
          </div>
        ))}
      </div>
      <div className="code-lab">
        <div className="code-lab-header">
          <div>
            <strong>{language === "cpp" ? "C++ 타이핑 실습" : "Python 타이핑 실습"}</strong>
            <span>
              {passedCount}/{checks.length} 검사 통과 · 실제 컴파일 대신 구조 검사와 시뮬레이션으로 검산
            </span>
          </div>
          <div className="code-actions">
            <button className="icon-button text-button" onClick={onExport} type="button">
              <Download size={15} aria-hidden />
              ROS2 Zip 내보내기
            </button>
            <button className="icon-button text-button" onClick={() => onChange(displayedCode)} type="button">
              <RotateCcw size={15} aria-hidden />
              초기화
            </button>
            <button className="icon-button text-button" onClick={() => setShowSolution((value) => !value)} type="button">
              <Eye size={15} aria-hidden />
              모범답안
            </button>
          </div>
        </div>
        <CodeMirror
          basicSetup={{
            bracketMatching: true,
            foldGutter: false,
            highlightActiveLine: true,
            lineNumbers: true,
          }}
          className="code-editor"
          extensions={extensions}
          height="340px"
          onChange={onChange}
          theme="dark"
          value={code}
        />
        {showSolution && (
          <pre className="code-block solution-block">
            <code>{displayedSolution}</code>
          </pre>
        )}
      </div>
      <div className="check-results">
        {checks.map((check) => (
          <div className={check.passed ? "check-result passed" : "check-result"} key={check.label}>
            {check.passed ? <CheckCircle2 size={16} aria-hidden /> : <XCircle size={16} aria-hidden />}
            <span>{check.label}</span>
          </div>
        ))}
      </div>
      <div className="task-list">
        <div className="panel-heading compact">
          <ClipboardCheck size={16} aria-hidden />
          <h3>{language === "cpp" ? "C++ 확장 과제" : "Python 확장 과제"}</h3>
        </div>
        <ul className="clean-list">
          {block.tasks.map((task) => (
            <li key={task}>{task}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function PracticePanel({ section, savedCode, onSaveCode }: PracticePanelProps) {
  const [language, setLanguage] = useState<PracticeKind>("cpp");
  const block = language === "cpp" ? section.cppPractice : section.pythonPractice;
  const storageKey = `${section.id}:${language}`;
  const firstExample = block.examples?.find((example) => example.language === language);
  const code = savedCode[storageKey] ?? firstExample?.starterCode ?? block.starterCode ?? block.code;

  if (section.v2Session) {
    return (
      <section className="panel">
        <div className="panel-heading">
          <Terminal size={18} aria-hidden />
          <h2>코드 실습</h2>
        </div>
        <div className="content-grid">
          {section.v2Session.codeLabs.map((lab) => (
            <CodeLabBlock key={lab.id} lab={lab} />
          ))}
          <ExecutableLab section={section} />
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <Terminal size={18} aria-hidden />
        <h2>코드 실습</h2>
      </div>
      <div className="segmented" aria-label="실습 언어 선택">
        <button className={language === "cpp" ? "is-active" : ""} onClick={() => setLanguage("cpp")} type="button">
          C++
        </button>
        <button
          className={language === "python" ? "is-active" : ""}
          onClick={() => setLanguage("python")}
          type="button"
        >
          Python
        </button>
      </div>
      <PracticeBlockView block={block} code={code} language={language} onChange={(nextCode) => onSaveCode(language, nextCode)} onExport={() => exportRos2Workspace(section.id, language, code)} />
      <ExecutableLab section={section} />
    </section>
  );
}
