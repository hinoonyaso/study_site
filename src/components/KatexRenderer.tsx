import { useMemo } from "react";
import katex from "katex";

/**
 * Automatically converts common math notation to LaTeX.
 * Handles plain-text expressions from curriculum data that aren't
 * already in LaTeX form.
 */
function autoLatex(raw: string): string {
  if (/\\[a-zA-Z]+/.test(raw)) return raw;
  let s = raw;
  // Function names → \func
  s = s.replace(/\b(cos|sin|tan|atan2|sqrt|log|ln|exp|det|max|min|abs)\b/g, "\\$1");
  // Greek letters
  s = s.replace(/\btheta\b/gi, "\\theta");
  s = s.replace(/\blambda\b/gi, "\\lambda");
  s = s.replace(/\bomega\b/gi, "\\omega");
  s = s.replace(/\bSigma\b/g, "\\Sigma");
  s = s.replace(/\bsigma\b/g, "\\sigma");
  s = s.replace(/\bpi\b/g, "\\pi");
  s = s.replace(/\bmu\b/g, "\\mu");
  s = s.replace(/\bdelta\b/g, "\\delta");
  s = s.replace(/\bDelta\b/g, "\\Delta");
  s = s.replace(/\balpha\b/g, "\\alpha");
  s = s.replace(/\bbeta\b/g, "\\beta");
  s = s.replace(/\bgamma\b/g, "\\gamma");
  s = s.replace(/\bkappa\b/g, "\\kappa");
  s = s.replace(/\bepsilon\b/g, "\\epsilon");
  // Subscripts: l1 → l_1, q1 → q_1, etc (single digit after single letter)
  s = s.replace(/\b([a-zA-Z])(\d)\b/g, "$1_$2");
  // Superscripts: ^2 → ^{2}, ^-1 → ^{-1}, ^T → ^{T}
  s = s.replace(/\^(-?\d+|[A-Z])/g, "^{$1}");
  // Fractions: a/b → \frac{a}{b} (simple single-token fractions)
  // Only for patterns like TP / (TP + FP) or 2PR / (P + R) — skip complex ones
  // Instead, let's handle common standalone fraction expressions
  // Replace · with \cdot
  s = s.replace(/·/g, "\\cdot ");
  // Replace ... arrow
  s = s.replace(/->/g, "\\to ");
  return s;
}

type BlockMathProps = {
  expression: string;
};

type InlineMathProps = {
  expression: string;
};

export function BlockMath({ expression }: BlockMathProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(autoLatex(expression), {
        displayMode: true,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return null;
    }
  }, [expression]);

  if (!html) {
    return <code className="katex-fallback">{expression}</code>;
  }
  return <span className="katex-block" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function InlineMath({ expression }: InlineMathProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(autoLatex(expression), {
        displayMode: false,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return null;
    }
  }, [expression]);

  if (!html) {
    return <code className="katex-fallback">{expression}</code>;
  }
  return <span className="katex-inline" dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Renders text with inline math expressions wrapped in $...$.
 * Text outside $ delimiters is rendered as-is. Text inside is
 * rendered with KaTeX.
 */
export function MathText({ text }: { text: string }) {
  const parts = useMemo(() => {
    const segments: Array<{ type: "text" | "math"; content: string }> = [];
    const regex = /\$([^$]+)\$/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: "text", content: text.slice(lastIndex, match.index) });
      }
      segments.push({ type: "math", content: match[1] });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      segments.push({ type: "text", content: text.slice(lastIndex) });
    }
    return segments;
  }, [text]);

  if (parts.length === 1 && parts[0].type === "text") {
    return <>{text}</>;
  }

  return (
    <>
      {parts.map((part, i) =>
        part.type === "math" ? (
          <InlineMath expression={part.content} key={i} />
        ) : (
          <span key={i}>{part.content}</span>
        ),
      )}
    </>
  );
}
