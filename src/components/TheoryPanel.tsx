import { BookMarked, Check, ExternalLink, FunctionSquare, Lightbulb, ListChecks, Target } from "lucide-react";
import { getSources } from "../data/sources";
import { ConceptTheoryBlock } from "./ConceptTheoryBlock";
import { EquationDerivationBlock } from "./EquationDerivationBlock";
import { HandCalculationBlock } from "./HandCalculationBlock";
import { BlockMath, MathText } from "./KatexRenderer";
import { KnowledgeMap } from "./KnowledgeMap";
import { MiniGraph } from "./MiniGraph";
import { ProofBlock } from "./ProofBlock";
import { SessionPrerequisiteGraph } from "./SessionPrerequisiteGraph";
import { VisualizationLinkedQuiz } from "./VisualizationLinkedQuiz";
import type { LessonSection } from "../types";

type TheoryPanelProps = {
  section: LessonSection;
};

export function TheoryPanel({ section }: TheoryPanelProps) {
  const unitSources = getSources([...new Set(section.theory.flatMap((unit) => unit.sourceIds))]);
  const resourcesToShow = [...(section.resources ?? []), ...unitSources].filter(
    (resource, index, all) => all.findIndex((candidate) => candidate.url === resource.url) === index,
  );

  return (
    <div className="content-grid">
      <section className="panel">
        <div className="panel-heading">
          <Target size={18} aria-hidden />
          <h2>학습 초점</h2>
        </div>
        <p className="lead"><MathText text={section.focus} /></p>
      </section>

      {section.v2Session && (
        <>
          <ConceptTheoryBlock session={section.v2Session} />
          <EquationDerivationBlock
            derivation={section.v2Session.theory.derivation}
            equations={section.v2Session.theory.equations}
          />
          <HandCalculationBlock handCalculation={section.v2Session.theory.handCalculation} />
          <VisualizationLinkedQuiz session={section.v2Session} visualizations={section.v2Session.visualizations} />
          <SessionPrerequisiteGraph session={section.v2Session} />
        </>
      )}

      <section className="panel theory-index">
        <div className="panel-heading">
          <BookMarked size={18} aria-hidden />
          <h2>소단원 목차</h2>
        </div>
        <div className="must-know-formulas">
          <strong>이 단원에서 반드시 설명할 공식</strong>
          <div>
            {section.theory
              .flatMap((unit) => unit.formulas)
              .slice(0, 8)
              .map((formula) => (
                <code key={`${formula.label}-${formula.expression}`}>{formula.label}</code>
              ))}
          </div>
        </div>
        <div className="unit-chips">
          {section.theory.map((unit) => (
            <a href={`#${unit.id}`} key={unit.id}>
              {unit.title}
            </a>
          ))}
        </div>
      </section>

      {section.theory.map((unit) => (
        <section className="panel theory-unit" id={unit.id} key={unit.id}>
          <div className="panel-heading">
            <Check size={18} aria-hidden />
            <h2>{unit.title}</h2>
          </div>
          <p className="lead"><MathText text={unit.summary} /></p>
          <div className="intuition-box">
            <strong>직관</strong>
            <p><MathText text={unit.intuition} /></p>
          </div>

          {unit.figures.length > 0 && (
            <div className="theory-subblock">
              <h3>개념 그래프</h3>
              <div className="mini-graph-grid">
                {unit.figures.map((figure) => (
                  <MiniGraph figure={figure} key={`${unit.id}-${figure.id}`} />
                ))}
              </div>
            </div>
          )}

          <div className="theory-subblock">
            <h3>상세 이론</h3>
            <ul className="clean-list">
              {unit.details.map((item) => (
                <li key={item}><MathText text={item} /></li>
              ))}
            </ul>
          </div>

          {unit.formulas.length > 0 && (
            <div className="theory-subblock">
              <div className="panel-heading compact">
                <FunctionSquare size={16} aria-hidden />
                <h3>핵심 공식</h3>
              </div>
              <div className="formula-grid">
                {unit.formulas.map((formula) => (
                  <div className="formula-box" key={`${unit.id}-${formula.label}`}>
                    <span>{formula.label}</span>
                    <div className="formula-katex">
                      <BlockMath expression={formula.expression} />
                    </div>
                    <small><MathText text={formula.description} /></small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {unit.derivation.length > 0 && (
            <div className="theory-subblock">
              <div className="panel-heading compact">
                <ListChecks size={16} aria-hidden />
                <h3>핵심 유도 과정</h3>
              </div>
              <ol className="step-list">
                {unit.derivation.map((step) => (
                  <li key={step}><MathText text={step} /></li>
                ))}
              </ol>
            </div>
          )}

          <div className="theory-subblock">
            <ProofBlock
              assumptions={unit.assumptions}
              engineeringMeaning={unit.engineeringMeaning}
              implementationNotes={unit.implementationNotes}
              proof={unit.proof}
            />
          </div>

          {unit.workedExample && (
            <div className="worked-example">
              <div className="panel-heading compact">
                <Lightbulb size={16} aria-hidden />
                <h3>계산 예제</h3>
              </div>
              <strong><MathText text={unit.workedExample.prompt} /></strong>
              <ol className="step-list">
                {unit.workedExample.steps.map((step) => (
                  <li key={step}><MathText text={step} /></li>
                ))}
              </ol>
              <p><MathText text={unit.workedExample.result} /></p>
            </div>
          )}

          {unit.commonMistakes.length > 0 && (
            <div className="theory-subblock">
              <h3>흔한 실수</h3>
              <ul className="clean-list">
                {unit.commonMistakes.map((mistake) => (
                  <li key={mistake}><MathText text={mistake} /></li>
                ))}
              </ul>
            </div>
          )}

          {(unit.readingGuide?.length ?? 0) > 0 && (
            <div className="theory-subblock reading-guide">
              <h3>공식자료 읽기 순서</h3>
              <ol className="step-list">
                {unit.readingGuide?.map((item) => (
                  <li key={item}><MathText text={item} /></li>
                ))}
              </ol>
            </div>
          )}
        </section>
      ))}

      <section className="panel">
        <div className="panel-heading">
          <Check size={18} aria-hidden />
          <h2>왜 필요한가</h2>
        </div>
        <ul className="clean-list">
          {section.why.map((item) => (
            <li key={item}><MathText text={item} /></li>
          ))}
        </ul>
      </section>

      {(section.cheats?.length ?? 0) > 0 && (
        <section className="panel">
          <div className="panel-heading">
            <FunctionSquare size={18} aria-hidden />
            <h2>ROS 2 명령어 치트시트</h2>
          </div>
          <div className="cheat-grid">
            {section.cheats?.map((cheat) => (
              <div className="cheat-card" key={`${cheat.domain}-${cheat.label}`}>
                <span>{cheat.domain}</span>
                <strong>{cheat.label}</strong>
                <code>{cheat.command}</code>
                <small><MathText text={cheat.description} /></small>
              </div>
            ))}
          </div>
        </section>
      )}

      <KnowledgeMap section={section} />

      {resourcesToShow.length > 0 && (
        <section className="panel">
          <div className="panel-heading">
            <ExternalLink size={18} aria-hidden />
            <h2>공식 자료 / 출처</h2>
          </div>
          <div className="resource-grid">
            {resourcesToShow.map((resource) => (
              <a href={resource.url} key={resource.url} rel="noreferrer" target="_blank">
                <span>{resource.domain}</span>
                <strong>{resource.title}</strong>
                <small>{resource.note}</small>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
