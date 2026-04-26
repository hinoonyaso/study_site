import { GitBranch } from "lucide-react";
import type { LessonSection } from "../types";

function shortId(value: string) {
  return value.replace(/--/g, " / ").replace(/-/g, " ");
}

export function KnowledgeMap({ section }: { section: LessonSection }) {
  const prerequisites = section.prerequisiteIds ?? [];
  const nextHints = section.scenarioTags?.slice(0, 3) ?? [];
  const hasData = prerequisites.length > 0 || nextHints.length > 0 || section.parentId;

  if (!hasData) return null;

  return (
    <section className="panel knowledge-panel">
      <div className="panel-heading">
        <GitBranch size={18} aria-hidden />
        <h2>개념 연결 맵</h2>
      </div>
      <div className="knowledge-map">
        <svg className="knowledge-svg" role="img" viewBox="0 0 620 190">
          <line className="knowledge-line" x1="150" x2="305" y1="95" y2="95" />
          <line className="knowledge-line" x1="315" x2="470" y1="95" y2="95" />
          <rect className="knowledge-node muted" height="74" rx="10" width="150" x="20" y="58" />
          <rect className="knowledge-node current" height="86" rx="12" width="210" x="205" y="52" />
          <rect className="knowledge-node next" height="74" rx="10" width="150" x="450" y="58" />
          <text className="knowledge-kicker" x="42" y="82">먼저 보기</text>
          <text className="knowledge-kicker" x="231" y="78">현재 세션</text>
          <text className="knowledge-kicker" x="474" y="82">다음 연결</text>
          <text className="knowledge-label" x="42" y="108">
            {prerequisites.length > 0 ? shortId(prerequisites[0]) : shortId(section.groupTitle ?? section.parentId ?? "overview")}
          </text>
          <text className="knowledge-label" x="231" y="108">{section.title.slice(0, 24)}</text>
          <text className="knowledge-label" x="474" y="108">
            {nextHints.length > 0 ? nextHints.join(" / ").slice(0, 24) : "simulation / quiz"}
          </text>
        </svg>
        <div className="knowledge-list">
          {prerequisites.length > 0 && (
            <div>
              <strong>선수 세션</strong>
              <span>{prerequisites.map(shortId).join(", ")}</span>
            </div>
          )}
          {nextHints.length > 0 && (
            <div>
              <strong>연결 주제</strong>
              <span>{nextHints.join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
