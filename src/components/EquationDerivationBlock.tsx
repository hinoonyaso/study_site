import { FunctionSquare, ListChecks } from "lucide-react";
import { BlockMath, MathText } from "./KatexRenderer";
import type { DerivationStep, EquationBlock } from "../types";

export function EquationDerivationBlock({
  equations,
  derivation,
}: {
  equations: EquationBlock[];
  derivation: DerivationStep[];
}) {
  return (
    <section className="panel theory-unit">
      <div className="panel-heading">
        <FunctionSquare size={18} aria-hidden />
        <h2>수식과 유도 과정</h2>
      </div>
      <div className="formula-grid">
        {equations.map((equation) => (
          <div className="formula-box" key={equation.label}>
            <span>{equation.label}</span>
            <BlockMath expression={equation.expression} />
            <small><MathText text={equation.explanation} /></small>
            <div className="parameter-table compact-table">
              {equation.terms.map((term) => (
                <div className="parameter-row" key={`${equation.label}-${term.symbol}`}>
                  <span>{term.symbol}</span>
                  <span>{term.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="theory-subblock">
        <div className="panel-heading compact">
          <ListChecks size={16} aria-hidden />
          <h3>유도 과정</h3>
        </div>
        <ol className="step-list">
          {derivation.map((item) => (
            <li key={`${item.title}-${item.detail}`}>
              <strong>{item.title}</strong>
              <p><MathText text={item.detail} /></p>
              {item.equation && <BlockMath expression={item.equation} />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
