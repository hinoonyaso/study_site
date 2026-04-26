import { useState } from "react";
import { Bug, Code2, Play, TestTube2 } from "lucide-react";
import type { CodeLab } from "../types";

const tabs = [
  ["starter", "starterCode", Code2],
  ["solution", "solutionCode", TestTube2],
  ["test", "testCode", Bug],
] as const;

export function CodeLabBlock({ lab }: { lab: CodeLab }) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number][0]>("starter");
  const code = activeTab === "starter" ? lab.starterCode : activeTab === "solution" ? lab.solutionCode : lab.testCode;

  return (
    <section className="practice-block">
      <div className="practice-meta">
        <strong>{lab.title}</strong>
        <span>{lab.theoryConnection}</span>
      </div>
      <div className="code-lab-header">
        <div>
          <strong>{lab.language.toUpperCase()} 코드랩</strong>
          <span>{lab.runCommand}</span>
        </div>
        <div className="code-actions">
          {tabs.map(([id, label, Icon]) => (
            <button className={activeTab === id ? "icon-button text-button is-active" : "icon-button text-button"} key={id} onClick={() => setActiveTab(id)} type="button">
              <Icon size={15} aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>
      <pre className="code-block solution-block">
        <code>{code}</code>
      </pre>
      <div className="parameter-table">
        <div className="parameter-row header">
          <span>expectedOutput</span>
          <span>{lab.expectedOutput}</span>
        </div>
      </div>
      <div className="task-list">
        <div className="panel-heading compact">
          <Bug size={16} aria-hidden />
          <h3>commonBugs</h3>
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
