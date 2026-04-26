import { BookCheck, Cpu, Lightbulb, Sigma } from "lucide-react";
import type { ReactNode } from "react";
import { MathText } from "./KatexRenderer";

type ProofBlockProps = {
  assumptions: string[];
  proof: string[];
  engineeringMeaning: string[];
  implementationNotes: string[];
};

function Block({ title, items, icon }: { title: string; items: string[]; icon: ReactNode }) {
  if (items.length === 0) return null;
  return (
    <div className="proof-card">
      <div className="panel-heading compact">
        {icon}
        <h3>{title}</h3>
      </div>
      <ol className="step-list">
        {items.map((item) => (
          <li key={item}><MathText text={item} /></li>
        ))}
      </ol>
    </div>
  );
}

export function ProofBlock({ assumptions, proof, engineeringMeaning, implementationNotes }: ProofBlockProps) {
  return (
    <div className="proof-grid">
      <Block icon={<Sigma size={16} aria-hidden />} items={assumptions} title="가정 / 전제" />
      <Block icon={<BookCheck size={16} aria-hidden />} items={proof} title="증명 / 유도" />
      <Block
        icon={<Lightbulb size={16} aria-hidden />}
        items={engineeringMeaning}
        title="공학적 의미"
      />
      <Block
        icon={<Cpu size={16} aria-hidden />}
        items={implementationNotes}
        title="구현 연결"
      />
    </div>
  );
}
