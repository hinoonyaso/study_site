import type { TheoryFigure, TheoryGraphId } from "../types";

type MiniGraphProps = {
  figure: TheoryFigure;
};

const points = (values: number[], width = 280, height = 130) =>
  values
    .map((value, index) => {
      const x = 22 + (index / Math.max(1, values.length - 1)) * (width - 44);
      const y = height - 18 - value * (height - 34);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

function GraphSvg({ id }: { id: TheoryGraphId }) {
  if (id === "rotation-basis") {
    return (
      <svg className="mini-graph-svg" viewBox="0 0 280 130" role="img">
        <line className="mini-axis" x1="26" x2="254" y1="96" y2="96" />
        <line className="mini-axis" x1="60" x2="60" y1="18" y2="112" />
        <line className="mini-vector muted" x1="60" x2="138" y1="96" y2="96" />
        <line className="mini-vector muted" x1="60" x2="60" y1="96" y2="28" />
        <line className="mini-vector accent" x1="60" x2="128" y1="96" y2="56" />
        <line className="mini-vector warm" x1="60" x2="98" y1="96" y2="32" />
        <text x="145" y="59">R e1</text>
        <text x="101" y="31">R e2</text>
      </svg>
    );
  }

  if (id === "gaussian-kf") {
    return (
      <svg className="mini-graph-svg" viewBox="0 0 280 130" role="img">
        <line className="mini-axis" x1="18" x2="262" y1="104" y2="104" />
        <polyline className="mini-line muted" points={points([0.02, 0.08, 0.22, 0.55, 0.92, 0.55, 0.22, 0.08, 0.02])} />
        <polyline className="mini-line accent" points={points([0.01, 0.03, 0.1, 0.34, 0.82, 0.78, 0.3, 0.09, 0.02])} />
        <circle className="mini-dot warm" cx="154" cy="45" r="5" />
        <text x="166" y="48">K update</text>
      </svg>
    );
  }

  if (id === "gradient-descent") {
    return (
      <svg className="mini-graph-svg" viewBox="0 0 280 130" role="img">
        <polyline className="mini-line muted" points="22,106 55,74 88,52 122,40 156,38 190,47 224,68 258,104" />
        <circle className="mini-dot warm" cx="222" cy="68" r="5" />
        <circle className="mini-dot accent" cx="176" cy="42" r="5" />
        <line className="mini-arrow" x1="216" x2="184" y1="65" y2="45" />
        <text x="96" y="28">loss(theta)</text>
      </svg>
    );
  }

  if (id === "covariance-ellipse") {
    return (
      <svg className="mini-graph-svg" viewBox="0 0 280 130" role="img">
        <line className="mini-axis" x1="26" x2="254" y1="96" y2="96" />
        <line className="mini-axis" x1="60" x2="60" y1="18" y2="112" />
        <ellipse className="mini-ellipse muted" cx="145" cy="68" rx="70" ry="24" transform="rotate(-24 145 68)" />
        <ellipse className="mini-ellipse accent" cx="145" cy="68" rx="32" ry="14" transform="rotate(-24 145 68)" />
        <circle className="mini-dot accent" cx="145" cy="68" r="5" />
        <text x="163" y="72">Sigma</text>
      </svg>
    );
  }

  if (id === "trajectory-polynomial") {
    return (
      <svg className="mini-graph-svg" viewBox="0 0 280 130" role="img">
        <line className="mini-axis" x1="18" x2="262" y1="104" y2="104" />
        <polyline
          className="mini-line accent"
          points="24,102 52,98 80,86 108,68 136,46 164,32 192,28 220,42 252,76"
        />
        <polyline className="mini-line warm" points="24,96 52,84 80,70 108,58 136,52 164,54 192,64 220,82 252,104" />
        <text x="30" y="24">q, dq smooth</text>
      </svg>
    );
  }

  if (id === "astar-cost") {
    const cells = Array.from({ length: 30 }, (_, index) => {
      const x = 26 + (index % 10) * 22;
      const y = 18 + Math.floor(index / 10) * 22;
      const isPath = [0, 1, 11, 12, 13, 23, 24, 25, 26, 27, 28, 29].includes(index);
      const isWall = [5, 15, 16, 17].includes(index);
      return <rect className={`mini-cell ${isPath ? "path" : ""} ${isWall ? "wall" : ""}`} height="18" key={index} width="18" x={x} y={y} />;
    });
    return (
      <svg className="mini-graph-svg" viewBox="0 0 280 130" role="img">
        {cells}
        <text x="26" y="106">f(n)=g(n)+h(n)</text>
      </svg>
    );
  }

  if (id === "confusion-matrix") {
    return (
      <svg className="mini-graph-svg" viewBox="0 0 280 130" role="img">
        <rect className="mini-matrix good" height="42" width="72" x="58" y="28" />
        <rect className="mini-matrix warn" height="42" width="72" x="136" y="28" />
        <rect className="mini-matrix warn" height="42" width="72" x="58" y="76" />
        <rect className="mini-matrix good" height="42" width="72" x="136" y="76" />
        <text x="82" y="53">TP</text>
        <text x="160" y="53">FP</text>
        <text x="82" y="101">FN</text>
        <text x="160" y="101">TN</text>
      </svg>
    );
  }

  if (id === "retrieval-pipeline") {
    return (
      <svg className="mini-graph-svg" viewBox="0 0 280 130" role="img">
        {["Docs", "Chunks", "Top-k", "Prompt", "Eval"].map((label, index) => (
          <g key={label}>
            <rect className="mini-node" height="34" rx="7" width="44" x={16 + index * 52} y="48" />
            <text x={25 + index * 52} y="69">{label}</text>
            {index < 4 && <line className="mini-link-line" x1={60 + index * 52} x2={68 + index * 52} y1="65" y2="65" />}
          </g>
        ))}
      </svg>
    );
  }

  return (
    <svg className="mini-graph-svg" viewBox="0 0 280 130" role="img">
      <circle className="mini-state good" cx="54" cy="64" r="24" />
      <circle className="mini-state warn" cx="142" cy="64" r="24" />
      <circle className="mini-state stop" cx="226" cy="64" r="24" />
      <line className="mini-link-line" x1="78" x2="118" y1="64" y2="64" />
      <line className="mini-link-line" x1="166" x2="202" y1="64" y2="64" />
      <text x="36" y="68">OK</text>
      <text x="123" y="68">WARN</text>
      <text x="207" y="68">STOP</text>
    </svg>
  );
}

export function MiniGraph({ figure }: MiniGraphProps) {
  return (
    <div className="mini-graph-card">
      <GraphSvg id={figure.id} />
      <div>
        <strong>{figure.title}</strong>
        <p>{figure.explanation}</p>
      </div>
    </div>
  );
}
