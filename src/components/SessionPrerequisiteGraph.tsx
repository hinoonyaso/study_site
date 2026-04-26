import { Network } from "lucide-react";
import type { Session } from "../types";

export function SessionPrerequisiteGraph({ session }: { session: Session }) {
  const nodes = [...session.prerequisites.map((id) => ["선수", id] as const), ["현재", session.id] as const, ...session.nextSessions.map((id) => ["다음", id] as const)];
  return (
    <section className="panel">
      <div className="panel-heading">
        <Network size={18} aria-hidden />
        <h2>Prerequisite Graph</h2>
      </div>
      <div className="flow-visual">
        {nodes.map(([kind, id], index) => (
          <div className="flow-step-wrap" key={`${kind}-${id}`}>
            <div className={kind === "현재" ? "flow-step is-active" : "flow-step"}>
              <span>{kind}</span>
              <strong>{id}</strong>
            </div>
            {index < nodes.length - 1 && <div className="flow-arrow">→</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
