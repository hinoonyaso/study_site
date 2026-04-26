import { Bot, Lightbulb, Target, Wrench } from "lucide-react";
import { MathText } from "./KatexRenderer";
import type { Session } from "../types";

export function ConceptTheoryBlock({ session }: { session: Session }) {
  const blocks = [
    ["개념 정의", session.theory.definition, Target],
    ["왜 필요한지", session.theory.whyItMatters, Wrench],
    ["직관적 설명", session.theory.intuition, Lightbulb],
    ["로봇 적용", session.theory.robotApplication, Bot],
  ] as const;

  return (
    <section className="panel theory-unit" id={`${session.id}-concept-theory`}>
      <div className="panel-heading">
        <Target size={18} aria-hidden />
        <h2>{session.title} 핵심 개념</h2>
      </div>
      <div className="formula-grid">
        {blocks.map(([title, text, Icon]) => (
          <div className="formula-box" key={title}>
            <span>
              <Icon size={14} aria-hidden /> {title}
            </span>
            <p><MathText text={text} /></p>
          </div>
        ))}
        {(session.estimatedMinutes || session.difficulty || session.realWorldUseCase) && (
          <div className="formula-box">
            <span>세션 메타</span>
            <p>
              {session.estimatedMinutes ? `${session.estimatedMinutes}분 · ` : ""}
              {session.difficulty ? `${session.difficulty} · ` : ""}
              <MathText text={session.realWorldUseCase ?? session.theory.robotApplication} />
            </p>
          </div>
        )}
      </div>
      {(session.commonMistakes?.length ?? 0) > 0 && (
        <div className="theory-subblock">
          <h3>실수/반례 체크</h3>
          <ul className="clean-list">
            {session.commonMistakes?.map((mistake) => (
              <li key={mistake}><MathText text={mistake} /></li>
            ))}
          </ul>
        </div>
      )}
      {session.extensionTask && (
        <div className="hint-box">
          확장 과제: <MathText text={session.extensionTask} />
        </div>
      )}
    </section>
  );
}
