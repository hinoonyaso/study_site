import { useState } from "react";
import { Bug, Check, Code2, Copy, Play, Terminal, TestTube2 } from "lucide-react";
import type { CodeLab } from "../types";

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
  const code = activeTab === "starter" ? lab.starterCode : activeTab === "solution" ? lab.solutionCode : lab.testCode;
  const languageCommand =
    lab.language === "cpp"
      ? "docker compose run --rm labs bash -lc \"g++ -std=c++17 your_lab.cpp -O2 && ./a.out\""
      : lab.language === "python"
        ? `docker compose run --rm labs bash -lc "${lab.runCommand}"`
        : lab.runCommand;

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

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
            <button className={activeTab === id ? "icon-button text-button is-active" : "icon-button text-button"} key={id} onClick={() => setActiveTab(id)} type="button">
              <Icon size={15} aria-hidden />
              {label}
            </button>
          ))}
          <button className="icon-button text-button copy-code-button" onClick={copyCode} type="button">
            {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
            {copied ? "복사됨" : "복사"}
          </button>
        </div>
      </div>
      <pre className="code-block solution-block">
        <code>{code}</code>
      </pre>
      <div className="local-run-guide">
        <div className="panel-heading compact">
          <Terminal size={16} aria-hidden />
          <h3>실행 가이드</h3>
        </div>
        <p>
          브라우저 내 실행은 JavaScript 실습에서 제공되고, Python/C++ 실습은 같은 저장소의
          <code>requirements.txt</code>와 <code>docker-compose.yml</code>로 재현합니다.
        </p>
        <code>{languageCommand}</code>
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
