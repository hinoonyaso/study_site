import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python as pythonLanguage } from "@codemirror/lang-python";
import { Bug, Check, CheckCircle2, Code2, Copy, ExternalLink, Loader2, Play, Terminal, TestTube2 } from "lucide-react";
import type { CodeLab } from "../types";
import { getBrowserPythonSupport, runPython, isPyodideLoaded } from "../utils/pyodideRunner";
import type { PythonRunResult } from "../utils/pyodideRunner";
import { openInGodbolt } from "../utils/godboltLink";

const tabs = [
  ["starter", "시작 코드", Code2],
  ["solution", "모범 답안", TestTube2],
  ["test", "테스트", Bug],
] as const;

const languageLabel: Record<CodeLab["language"], string> = {
  cpp: "C++",
  javascript: "JavaScript",
  python: "Python",
};

export function CodeLabBlock({ lab }: { lab: CodeLab }) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number][0]>("starter");
  const [copied, setCopied] = useState(false);

  // Python 실행 상태
  const [editableCode, setEditableCode] = useState(lab.starterCode);
  const [isRunning, setIsRunning] = useState(false);
  const [runOutput, setRunOutput] = useState<PythonRunResult | null>(null);

  // C++ Godbolt 상태
  const [godboltStatus, setGodboltStatus] = useState<"idle" | "loading" | "copied">("idle");

  const code = activeTab === "starter" ? lab.starterCode : activeTab === "solution" ? lab.solutionCode : lab.testCode;
  const codeToRun = activeTab === "starter" ? editableCode : code;
  const browserPythonSupport = lab.language === "python" ? getBrowserPythonSupport(codeToRun) : null;

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const handleRunPython = async () => {
    setIsRunning(true);
    setRunOutput(null);
    try {
      const result = await runPython(codeToRun);
      setRunOutput(result);
    } finally {
      setIsRunning(false);
    }
  };

  const handleOpenGodbolt = async () => {
    setGodboltStatus("loading");
    await openInGodbolt(code);
    setGodboltStatus("copied");
    window.setTimeout(() => setGodboltStatus("idle"), 2000);
  };

  const outputMatchesExpected =
    runOutput && lab.expectedOutput
      ? runOutput.stdout.trim() === lab.expectedOutput.trim()
      : false;

  const isFirstLoad = !isPyodideLoaded();

  const needsGpu = lab.language === "python" && (
    lab.starterCode.includes("import torch") ||
    lab.starterCode.includes("transformers") ||
    lab.starterCode.includes("tensorrt") ||
    lab.starterCode.includes("cuda") ||
    lab.starterCode.includes("onnx") ||
    lab.starterCode.includes("llava")
  );

  return (
    <section className="practice-block code-lab-card">
      <div className="practice-meta">
        <strong>{lab.title}</strong>
        <span>{lab.theoryConnection}</span>
      </div>
      <div className="code-lab-header">
        <div>
          <strong>{languageLabel[lab.language]} 코드랩</strong>
          <span>{lab.runCommand}</span>
        </div>
        <div className="code-actions">
          {tabs.map(([id, label, Icon]) => (
            <button
              className={activeTab === id ? "icon-button text-button is-active" : "icon-button text-button"}
              key={id}
              onClick={() => setActiveTab(id)}
              type="button"
            >
              <Icon size={15} aria-hidden />
              {label}
            </button>
          ))}
          <button className="icon-button text-button copy-code-button" onClick={copyCode} type="button">
            {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
            {copied ? "복사됨" : "복사"}
          </button>
          {lab.language === "python" && (() => {
            const colabUrl = lab.colabLink || (needsGpu ? "https://colab.research.google.com/" : undefined);
            if (!colabUrl) return null;
            return (
              <button
                className="icon-button text-button"
                onClick={() => window.open(colabUrl, "_blank", "noopener")}
                type="button"
              >
                <ExternalLink size={15} aria-hidden />
                Google Colab에서 열기
              </button>
            );
          })()}
          {lab.language === "python" && !needsGpu && (
            browserPythonSupport?.supported ? (
              <button
                className="icon-button text-button run-button"
                disabled={isRunning}
                onClick={handleRunPython}
                type="button"
              >
                {isRunning ? <Loader2 size={15} className="spin" aria-hidden /> : <Play size={15} aria-hidden />}
                {isRunning ? (isFirstLoad ? "Python 환경 초기화 중... (최초 1회, 약 10초)" : "실행 중...") : "브라우저에서 실행"}
              </button>
            ) : (
              <span className="runtime-badge warning" title={browserPythonSupport?.reason}>
                브라우저 미지원: {browserPythonSupport?.unsupportedImports.join(", ")}
              </span>
            )
          )}
          {lab.language === "cpp" && (
            <button
              className="icon-button text-button"
              disabled={godboltStatus === "loading"}
              onClick={handleOpenGodbolt}
              title="새 탭에서 열립니다"
              type="button"
            >
              {godboltStatus === "loading" ? (
                <Loader2 size={15} className="spin" aria-hidden />
              ) : godboltStatus === "copied" ? (
                <Check size={15} aria-hidden />
              ) : (
                <ExternalLink size={15} aria-hidden />
              )}
              {godboltStatus === "copied" ? "복사됨!" : "Compiler Explorer"}
            </button>
          )}
        </div>
      </div>

      {/* Python starter 탭: 편집 가능한 CodeMirror */}
      {lab.language === "python" && needsGpu && (
        <div className="hint-box warning" style={{ marginBottom: "12px", borderLeftColor: "#f59e0b", backgroundColor: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", gap: "8px" }}>
          <strong>⚠️ 이 코드는 Colab에서 실행하세요</strong>
        </div>
      )}
      {lab.language === "python" && activeTab === "starter" ? (
        <CodeMirror
          basicSetup={{ bracketMatching: true, foldGutter: false, highlightActiveLine: true, lineNumbers: true }}
          className="code-editor"
          extensions={[pythonLanguage()]}
          height="300px"
          onChange={setEditableCode}
          theme="dark"
          value={editableCode}
        />
      ) : (
        <pre className="code-block solution-block">
          <code>{code}</code>
        </pre>
      )}

      {/* Python 실행 출력 */}
      {runOutput && (
        <div className="run-output">
          <div className="run-output-header">
            <Terminal size={14} aria-hidden />
            <span>출력</span>
            <span>
              {runOutput.elapsedMs.toFixed(0)}ms
              {runOutput.loadedPackages.length > 0 ? ` · ${runOutput.loadedPackages.join(", ")}` : ""}
            </span>
            {outputMatchesExpected && (
              <span className="run-output-match">
                <CheckCircle2 size={13} aria-hidden /> 기대 출력과 일치
              </span>
            )}
          </div>
          <pre className="run-output-body">{runOutput.stdout || "(출력 없음)"}</pre>
          {runOutput.stderr && <pre className="run-error">{runOutput.stderr}</pre>}
        </div>
      )}

      <div className="local-run-guide">
        <div className="panel-heading compact">
          <Terminal size={16} aria-hidden />
          <h3>실행 가이드</h3>
        </div>
        {lab.language === "python" ? (
          <p>
            위 에디터에서 코드를 수정하고 <strong>브라우저에서 실행</strong> 버튼을 누르면 Python stdlib, NumPy, SciPy,
            Matplotlib 실습을 바로 실행합니다. PyTorch, ONNX Runtime, OpenCV, ROS 2 코드는 로컬/Colab 실행을 사용하세요.
          </p>
        ) : lab.language === "cpp" ? (
          <p>
            <strong>Compiler Explorer</strong> 버튼을 누르면 코드가 클립보드에 복사되고 Eigen 3.4가 설정된 Godbolt로 이동합니다.
            에디터에 <kbd>Ctrl+V</kbd>로 붙여넣은 뒤 실행하세요. 로컬 실행:
          </p>
        ) : (
          <p>브라우저 내 실행은 JavaScript 실습에서 제공됩니다.</p>
        )}
        {lab.language !== "python" && (
          <code>
            {lab.language === "cpp"
              ? `docker compose run --rm labs bash -lc "g++ -std=c++17 your_lab.cpp -O2 && ./a.out"`
              : `docker compose run --rm labs bash -lc "${lab.runCommand}"`}
          </code>
        )}
      </div>

      <div className="parameter-table">
        <div className="parameter-row header">
          <span>기대 출력</span>
          <span>{lab.expectedOutput}</span>
        </div>
      </div>
      <div className="task-list">
        <div className="panel-heading compact">
          <Bug size={16} aria-hidden />
          <h3>흔한 버그</h3>
        </div>
        <ul className="clean-list">
          {lab.commonBugs.map((bug) => (
            <li key={bug}>{bug}</li>
          ))}
        </ul>
      </div>
      <div className="hint-box">
        <Play size={14} aria-hidden /> 확장 과제: {lab.extensionTask}
      </div>
    </section>
  );
}
