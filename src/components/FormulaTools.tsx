import { useMemo } from "react";
import katex from "katex";
import type { QuizDifficulty } from "../types";

const formulaTokens = [
  "θ",
  "π",
  "sin()",
  "cos()",
  "tan()",
  "sqrt()",
  "^2",
  "^-1",
  "∂/∂q",
  "Σ",
  "J(q)",
  "R(θ)",
  "T",
  "P(x|z)",
  "μ",
  "Σ covariance",
];

export function FormulaInputToolbar({ onInsert }: { onInsert: (token: string) => void }) {
  return (
    <div className="formula-toolbar" aria-label="공학용 수식 입력 도구">
      {formulaTokens.map((token) => (
        <button key={token} onClick={() => onInsert(token)} type="button">
          {token}
        </button>
      ))}
    </div>
  );
}

function autoLatexPreview(value: string): string {
  let s = value;
  s = s.replace(/\b(cos|sin|tan|atan2|sqrt|log|ln|exp|det)\b/g, "\\$1");
  s = s.replace(/theta/gi, "\\theta");
  s = s.replace(/lambda/gi, "\\lambda");
  s = s.replace(/omega/gi, "\\omega");
  s = s.replace(/Sigma/g, "\\Sigma");
  s = s.replace(/\bpi\b/g, "\\pi");
  s = s.replace(/\bmu\b/g, "\\mu");
  s = s.replace(/\b([a-zA-Z])(\d)\b/g, "$1_$2");
  s = s.replace(/\^(-?\d+|[A-Z])/g, "^{$1}");
  return s;
}

export function FormulaPreview({ value }: { value: string }) {
  if (!value.trim()) return null;

  const html = useMemo(() => {
    try {
      return katex.renderToString(autoLatexPreview(value), {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return null;
    }
  }, [value]);

  return (
    <div className="formula-preview">
      <span>수식 미리보기</span>
      {html ? (
        <span className="formula-preview-katex" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <code>{value}</code>
      )}
    </div>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty?: QuizDifficulty }) {
  const value = difficulty ?? "기초";
  return <span className={`difficulty-badge level-${value}`}>{value}</span>;
}
