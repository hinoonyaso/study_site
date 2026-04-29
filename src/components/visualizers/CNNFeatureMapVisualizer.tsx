import { useMemo, useState } from "react";
import { Cpu, Grid3X3, Layers3, Workflow } from "lucide-react";
import { tinyOnnxDemoWeights } from "../../data/vision_ai/staticOnnxDemoWeights";
import { Slider, VisualFrame } from "./VisualizerUtils";

type Grid = number[][];

const patterns = ["lane", "box", "empty"] as const;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const makeInputGrid = (patternIndex: number, lighting: number, sensorNoise: number): Grid => {
  const pattern = patterns[patternIndex] ?? "lane";
  return Array.from({ length: tinyOnnxDemoWeights.inputSize }, (_, y) =>
    Array.from({ length: tinyOnnxDemoWeights.inputSize }, (_, x) => {
      const deterministicNoise = Math.sin((x + 1) * 12.9898 + (y + 1) * 78.233) * 0.5 + 0.5;
      const noise = (deterministicNoise - 0.5) * sensorNoise;
      let signal = 0.08;

      if (pattern === "lane") {
        const leftLane = Math.abs(x - 2) <= 0.35 && y >= 1;
        const rightLane = Math.abs(x - 5) <= 0.35 && y >= 1;
        const roadCenter = x >= 3 && x <= 4 && y >= 3 ? 0.22 : 0;
        signal = leftLane || rightLane ? 0.92 : 0.1 + roadCenter;
      }

      if (pattern === "box") {
        const inside = x >= 2 && x <= 5 && y >= 2 && y <= 5;
        const border = inside && (x === 2 || x === 5 || y === 2 || y === 5);
        signal = border ? 0.95 : inside ? 0.58 : 0.08;
      }

      if (pattern === "empty") {
        signal = 0.12 + 0.08 * Math.sin((x + y) * 0.9);
      }

      return clamp01(signal * lighting + noise);
    }),
  );
};

const convolveValid = (input: Grid, kernel: readonly (readonly number[])[]): Grid => {
  const outSize = input.length - kernel.length + 1;
  return Array.from({ length: outSize }, (_, y) =>
    Array.from({ length: outSize }, (_, x) => {
      let sum = 0;
      for (let ky = 0; ky < kernel.length; ky += 1) {
        for (let kx = 0; kx < kernel[ky].length; kx += 1) {
          sum += input[y + ky][x + kx] * kernel[ky][kx];
        }
      }
      return Math.max(0, sum);
    }),
  );
};

const average = (grid: Grid) => grid.flat().reduce((sum, value) => sum + value, 0) / grid.flat().length;

const softmax = (logits: number[]) => {
  const maxLogit = Math.max(...logits);
  const exp = logits.map((value) => Math.exp(value - maxLogit));
  const sum = exp.reduce((acc, value) => acc + value, 0);
  return exp.map((value) => value / sum);
};

const classify = (pooled: number[]) => {
  const denseRows: readonly (readonly number[])[] = tinyOnnxDemoWeights.dense;
  const biases: readonly number[] = tinyOnnxDemoWeights.bias;
  const logits = denseRows.map((row, classIndex) =>
    row.reduce<number>((sum, weight, channelIndex) => sum + weight * pooled[channelIndex], biases[classIndex] ?? 0),
  );
  const probabilities = softmax(logits);
  const topIndex = probabilities.reduce((best, value, index) => (value > probabilities[best] ? index : best), 0);
  return {
    logits,
    probabilities,
    topIndex,
    label: tinyOnnxDemoWeights.classes[topIndex],
    confidence: probabilities[topIndex],
  };
};

const formatVector = (values: readonly number[]) => `[${values.map((value) => value.toFixed(2)).join(", ")}]`;

function GridView({ grid, threshold }: { grid: Grid; threshold: number }) {
  const maxValue = Math.max(...grid.flat(), 1e-6);
  return (
    <div className="grid-visual" style={{ gridTemplateColumns: `repeat(${grid[0].length}, 1fr)` }}>
      {grid.flat().map((value, index) => {
        const intensity = clamp01(value / maxValue);
        const active = value >= threshold;
        const background = active
          ? `rgba(245, 158, 11, ${0.35 + intensity * 0.55})`
          : `rgba(148, 163, 184, ${0.12 + intensity * 0.28})`;
        return (
          <div
            className={active ? "grid-cell is-path" : "grid-cell"}
            key={index}
            style={{ background, opacity: 0.65 + intensity * 0.35 }}
            title={value.toFixed(3)}
          />
        );
      })}
    </div>
  );
}

export function CNNFeatureMapVisualizer() {
  const [patternIndex, setPatternIndex] = useState(0);
  const [channelIndex, setChannelIndex] = useState(0);
  const [lighting, setLighting] = useState(1);
  const [sensorNoise, setSensorNoise] = useState(0.08);
  const [threshold, setThreshold] = useState(0.35);

  const state = useMemo(() => {
    const input = makeInputGrid(patternIndex, lighting, sensorNoise);
    const featureMaps = tinyOnnxDemoWeights.kernels.map((kernel) => convolveValid(input, kernel.weights));
    const pooled = featureMaps.map(average);
    return {
      input,
      featureMaps,
      pooled,
      result: classify(pooled),
    };
  }, [patternIndex, lighting, sensorNoise]);

  const selectedKernel = tinyOnnxDemoWeights.kernels[channelIndex] ?? tinyOnnxDemoWeights.kernels[0];
  const selectedFeatureMap = state.featureMaps[channelIndex] ?? state.featureMaps[0];
  const onnxReady = state.result.confidence >= 0.45 && sensorNoise <= 0.35;

  return (
    <VisualFrame
      icon={<Grid3X3 size={18} aria-hidden />}
      metrics={[
        ["input", tinyOnnxDemoWeights.layout],
        ["top class", `${state.result.label} ${(state.result.confidence * 100).toFixed(1)}%`],
        ["feature map", `${selectedFeatureMap.length} x ${selectedFeatureMap.length}`],
      ]}
      title="ONNX-style Tiny CNN Feature Map"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="input pattern" max={2} min={0} onChange={setPatternIndex} step={1} value={patternIndex} suffix={` ${patterns[patternIndex]}`} />
          <Slider label="feature channel" max={2} min={0} onChange={setChannelIndex} step={1} value={channelIndex} suffix={` ${selectedKernel.name}`} />
          <Slider label="lighting gain" max={1.5} min={0.5} onChange={setLighting} step={0.05} value={lighting} />
          <Slider label="sensor noise" max={0.5} min={0} onChange={setSensorNoise} step={0.02} value={sensorNoise} />
          <Slider label="activation threshold" max={1.5} min={0.05} onChange={setThreshold} step={0.05} value={threshold} />
        </div>

        <div style={{ display: "grid", gap: "14px" }}>
          <div className="matrix-step-grid">
            <div className="matrix-card">
              <span>
                <Cpu size={14} aria-hidden /> static ONNX-style weights
              </span>
              <code>{tinyOnnxDemoWeights.inputName} -&gt; Conv(3x3) -&gt; GAP -&gt; {tinyOnnxDemoWeights.outputName}</code>
            </div>
            <div className="matrix-card">
              <span>
                <Layers3 size={14} aria-hidden /> selected kernel
              </span>
              <code>{selectedKernel.weights.map((row) => formatVector(row)).join("\n")}</code>
            </div>
            <div className={onnxReady ? "matrix-card is-pass" : "matrix-card is-fail"}>
              <span>
                <Workflow size={14} aria-hidden /> browser deployment gate
              </span>
              <code>{onnxReady ? "tensor contract ok" : "confidence/noise gate blocked"}</code>
            </div>
          </div>

          <div className="matrix-step-grid">
            <div className="matrix-card">
              <span>input image</span>
              <GridView grid={state.input} threshold={0.45} />
            </div>
            <div className="matrix-card">
              <span>{selectedKernel.name} feature map</span>
              <GridView grid={selectedFeatureMap} threshold={threshold} />
            </div>
          </div>

          <div className="matrix-step-grid">
            <div className="matrix-card">
              <span>global average pooling</span>
              <code>{formatVector(state.pooled)}</code>
            </div>
            {tinyOnnxDemoWeights.classes.map((label, index) => (
              <div className={index === state.result.topIndex ? "matrix-card is-pass" : "matrix-card"} key={label}>
                <span>{label}</span>
                <code>
                  logit={state.result.logits[index].toFixed(3)}
                  {"\n"}p={state.result.probabilities[index].toFixed(3)}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}
