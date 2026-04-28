import { useCallback, useEffect, useMemo, useState } from "react";
import { Code2, Play, RotateCcw, ShieldCheck } from "lucide-react";
import type { LessonSection } from "../types";

type RunState = {
  status: "idle" | "running" | "done" | "error";
  logs: string[];
  result: unknown;
  error?: string;
  elapsedMs?: number;
};

type WorkerMessage =
  | { type: "done"; logs: string[]; result: unknown; elapsedMs: number }
  | { type: "error"; logs: string[]; error: string; elapsedMs: number };

const JS_LAB_TIMEOUT_MS = 5_000;

const runInWorker = (code: string, timeoutMs = JS_LAB_TIMEOUT_MS) =>
  new Promise<WorkerMessage>((resolve) => {
    const workerSource = `
      self.onmessage = (event) => {
        const logs = [];
        const started = performance.now();
        const consoleProxy = {
          log: (...args) => logs.push(args.map((arg) => {
            try { return typeof arg === "string" ? arg : JSON.stringify(arg); }
            catch { return String(arg); }
          }).join(" "))
        };
        try {
          const runner = new Function("console", \`
            "use strict";
            const self = undefined;
            const globalThis = undefined;
            const fetch = undefined;
            const XMLHttpRequest = undefined;
            const WebSocket = undefined;
            const importScripts = undefined;
            \${event.data}
          \`);
          const result = runner(consoleProxy);
          self.postMessage({ type: "done", logs, result, elapsedMs: performance.now() - started });
        } catch (error) {
          self.postMessage({ type: "error", logs, error: error?.message ?? String(error), elapsedMs: performance.now() - started });
        }
      };
    `;
    const blob = new Blob([workerSource], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    const timer = window.setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ type: "error", logs: [], error: `timeout ${timeoutMs}ms`, elapsedMs: timeoutMs });
    }, timeoutMs);

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      window.clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(event.data);
    };

    worker.onerror = (event) => {
      window.clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ type: "error", logs: [], error: event.message, elapsedMs: 0 });
    };

    worker.postMessage(code);
  });

const flattenResultRows = (value: unknown): Array<[string, string]> => {
  if (!value || typeof value !== "object") return [["result", String(value)]];
  return Object.entries(value as Record<string, unknown>).map(([key, item]) => [
    key,
    Array.isArray(item) ? item.map((entry) => String(entry)).join(", ") : typeof item === "number" ? item.toFixed(4) : String(item),
  ]);
};

const numericSeriesFromResult = (value: unknown) => {
  if (!value || typeof value !== "object") return [] as number[];
  const entries = Object.values(value as Record<string, unknown>);
  const arraySeries = entries.find((item): item is number[] => Array.isArray(item) && item.every((entry) => typeof entry === "number"));
  if (arraySeries) return arraySeries;
  const numbers = entries.filter((item): item is number => typeof item === "number" && Number.isFinite(item));
  return numbers;
};

function ResultGraph({ result }: { result: unknown }) {
  const series = numericSeriesFromResult(result);
  if (series.length === 0) {
    return <div className="empty-graph">숫자 배열 또는 숫자 결과가 있으면 그래프로 표시됩니다.</div>;
  }
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = Math.max(1e-6, max - min);
  const points = series
    .map((value, index) => {
      const x = 18 + (index / Math.max(1, series.length - 1)) * 244;
      const y = 104 - ((value - min) / range) * 82;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg className="lab-result-graph" viewBox="0 0 280 124" role="img">
      <line className="mini-axis" x1="16" x2="264" y1="104" y2="104" />
      <line className="mini-axis" x1="18" x2="18" y1="18" y2="108" />
      <polyline className="mini-line accent" points={points} />
      {series.map((value, index) => {
        const x = 18 + (index / Math.max(1, series.length - 1)) * 244;
        const y = 104 - ((value - min) / range) * 82;
        return <circle className="mini-dot accent" cx={x} cy={y} key={`${value}-${index}`} r="3.5" />;
      })}
      <text x="22" y="17">result series</text>
    </svg>
  );
}

export function ExecutableLab({ section }: { section: LessonSection }) {
  const starter = section.cppPractice.executableJsStarter ?? "console.log('ready');\nreturn { ok: true };";
  const storageKey = `physical-ai-js-lab:${section.id}`;
  const [code, setCode] = useState(() => window.localStorage.getItem(storageKey) ?? starter);
  const [showSolution, setShowSolution] = useState(false);
  const [runState, setRunState] = useState<RunState>({ status: "idle", logs: [], result: null });

  useEffect(() => {
    setCode(window.localStorage.getItem(storageKey) ?? starter);
    setRunState({ status: "idle", logs: [], result: null });
    setShowSolution(false);
  }, [starter, storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, code);
  }, [code, storageKey]);

  const rows = useMemo(() => flattenResultRows(runState.result), [runState.result]);

  const run = useCallback(async () => {
    setRunState({ status: "running", logs: ["실행 중..."], result: null });
    const result = await runInWorker(code);
    if (result.type === "done") {
      setRunState({ status: "done", logs: result.logs, result: result.result, elapsedMs: result.elapsedMs });
    } else {
      setRunState({ status: "error", logs: result.logs, result: null, error: result.error, elapsedMs: result.elapsedMs });
    }
  }, [code]);

  useEffect(() => {
    window.addEventListener("physical-ai:run-js-lab", run);
    return () => window.removeEventListener("physical-ai:run-js-lab", run);
  }, [run]);

  return (
    <div className="executable-lab">
      <div className="code-lab-header">
        <div>
          <strong>실행 가능한 JS 알고리즘 실습</strong>
          <span>
            Web Worker에서 {JS_LAB_TIMEOUT_MS}ms timeout으로 실행 · 기대 결과 {section.cppPractice.expectedResultShape ?? "JSON"}
          </span>
        </div>
        <div className="code-actions">
          <button className="icon-button text-button" onClick={run} type="button">
            <Play size={15} aria-hidden />
            실행
          </button>
          <button className="icon-button text-button" onClick={() => setCode(starter)} type="button">
            <RotateCcw size={15} aria-hidden />
            초기화
          </button>
          <button className="icon-button text-button" onClick={() => setShowSolution((value) => !value)} type="button">
            <Code2 size={15} aria-hidden />
            해설 코드
          </button>
        </div>
      </div>
      <div className="lab-body-grid">
        <div className="js-editor-wrap">
          <textarea
            aria-label="실행 가능한 JS 실습 코드"
            className="js-code-input"
            onChange={(event) => setCode(event.target.value)}
            spellCheck={false}
            value={code}
          />
          {showSolution && (
            <pre className="code-block solution-block">
              <code>{section.cppPractice.executableJsSolution ?? starter}</code>
            </pre>
          )}
        </div>
        <div className="lab-result-panel">
          <div className={`run-status ${runState.status}`}>
            <ShieldCheck size={15} aria-hidden />
            <span>
              {runState.status === "idle" && "아직 실행 전"}
              {runState.status === "running" && "실행 중"}
              {runState.status === "done" && `완료 ${runState.elapsedMs?.toFixed(1)}ms`}
              {runState.status === "error" && `오류 ${runState.elapsedMs?.toFixed(1) ?? ""}ms`}
            </span>
          </div>
          <div className="lab-output-grid">
            <div className="lab-console">
              <strong>console</strong>
              <pre>{runState.error ?? (runState.logs.length ? runState.logs.join("\n") : "console.log 결과가 여기에 표시됩니다.")}</pre>
            </div>
            <div className="lab-table">
              <strong>result table</strong>
              {runState.status === "done" ? (
                rows.map(([key, value]) => (
                  <div className="lab-table-row" key={key}>
                    <span>{key}</span>
                    <code>{value}</code>
                  </div>
                ))
              ) : (
                <p>실행 후 return 값이 표로 표시됩니다.</p>
              )}
            </div>
            <div className="lab-graph">
              <strong>graph</strong>
              <ResultGraph result={runState.result} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
