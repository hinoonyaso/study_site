import { Calculator } from "lucide-react";
import { MathText } from "./KatexRenderer";
import type { HandCalculation } from "../types";

export function HandCalculationBlock({ handCalculation }: { handCalculation: HandCalculation }) {
  return (
    <section className="panel worked-example">
      <div className="panel-heading">
        <Calculator size={18} aria-hidden />
        <h2>손계산 예제</h2>
      </div>
      <strong><MathText text={handCalculation.problem} /></strong>
      <div className="parameter-table">
        <div className="parameter-row header">
          <span>given</span>
          <span>value</span>
        </div>
        {Object.entries(handCalculation.given).map(([key, value]) => (
          <div className="parameter-row" key={key}>
            <span>{key}</span>
            <span>{String(value)}</span>
          </div>
        ))}
      </div>
      <ol className="step-list">
        {handCalculation.steps.map((step) => (
          <li key={step}><MathText text={step} /></li>
        ))}
      </ol>
      <p><strong>답:</strong> <MathText text={handCalculation.answer} /></p>
    </section>
  );
}
