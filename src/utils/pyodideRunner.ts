declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideInterface>;
    PYODIDE_BASE_URL?: string;
  }
}

interface PyodideInterface {
  loadPackage: (packages: string[]) => Promise<void>;
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (options: { batched: (text: string) => void }) => void;
  setStderr: (options: { batched: (text: string) => void }) => void;
}

export type BrowserPythonSupport = {
  supported: boolean;
  requiredPackages: string[];
  unsupportedImports: string[];
  reason?: string;
};

export type PythonRunResult = {
  stdout: string;
  stderr: string;
  loadedPackages: string[];
  elapsedMs: number;
};

let pyodideInstance: PyodideInterface | null = null;
let loadingPromise: Promise<PyodideInterface> | null = null;
const loadedPackages = new Set<string>();
let activePyodideBaseUrl = "";
let preferLocalPyodide = true;

const PYODIDE_VERSION = "0.29.3";
const PYODIDE_CDN_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const DEFAULT_PYTHON_TIMEOUT_MS = 3_000;

const pyodideBaseUrls = () =>
  [
    window.PYODIDE_BASE_URL,
    preferLocalPyodide ? new URL("pyodide/", document.baseURI).href : undefined,
    PYODIDE_CDN_URL,
  ].filter((url): url is string => Boolean(url));

const importPattern = (name: string) =>
  new RegExp(`(^|\\n)\\s*(?:import\\s+${name}\\b|from\\s+${name}\\b)`);

const packageDetectors: Array<{ name: string; patterns: RegExp[] }> = [
  { name: "numpy", patterns: [importPattern("numpy"), /\bnp\./] },
  { name: "scipy", patterns: [importPattern("scipy"), /\bscipy\./] },
  { name: "matplotlib", patterns: [importPattern("matplotlib"), /\bplt\./] },
];

const unsupportedDetectors = [
  "torch",
  "tensorflow",
  "onnx",
  "onnxruntime",
  "cv2",
  "sklearn",
  "pandas",
].map((name) => ({ name, pattern: importPattern(name) }));

export function getBrowserPythonSupport(code: string): BrowserPythonSupport {
  const unsupportedImports = unsupportedDetectors
    .filter(({ pattern }) => pattern.test(code))
    .map(({ name }) => name);

  if (unsupportedImports.length > 0) {
    return {
      supported: false,
      requiredPackages: [],
      unsupportedImports,
      reason: `브라우저 Python은 ${unsupportedImports.join(", ")} 패키지를 지원하지 않습니다. 로컬 venv, Docker lab shell, 또는 Colab에서 실행하세요.`,
    };
  }

  const requiredPackages = packageDetectors
    .filter(({ patterns }) => patterns.some((pattern) => pattern.test(code)))
    .map(({ name }) => name);

  return {
    supported: true,
    requiredPackages: [...new Set(requiredPackages)],
    unsupportedImports: [],
  };
}

async function loadPyodideScript(indexURL: string): Promise<void> {
  if (window.loadPyodide) return;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${indexURL}pyodide.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error(`Pyodide 스크립트 로드 실패: ${script.src}`));
    };
    document.head.appendChild(script);
  });
}

async function getPyodide(): Promise<PyodideInterface> {
  if (pyodideInstance) return pyodideInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const errors: string[] = [];
    for (const indexURL of pyodideBaseUrls()) {
      try {
        await loadPyodideScript(indexURL);
        if (!window.loadPyodide) throw new Error("window.loadPyodide가 등록되지 않았습니다.");
        const pyodide = await window.loadPyodide({ indexURL });
        pyodideInstance = pyodide;
        activePyodideBaseUrl = indexURL;
        return pyodide;
      } catch (err) {
        errors.push(`${indexURL}: ${String(err)}`);
      }
    }
    throw new Error(`Pyodide 초기화 실패. 시도한 경로:\n${errors.join("\n")}`);
  })().catch((err) => {
    loadingPromise = null;
    throw err;
  });

  return loadingPromise;
}

async function ensurePackages(pyodide: PyodideInterface, packages: string[]): Promise<void> {
  const missing = packages.filter((name) => !loadedPackages.has(name));
  if (missing.length === 0) return;

  try {
    await pyodide.loadPackage(missing);
    missing.forEach((name) => loadedPackages.add(name));
  } catch (err) {
    if (activePyodideBaseUrl !== PYODIDE_CDN_URL) {
      const localError = String(err);
      pyodideInstance = null;
      loadingPromise = null;
      activePyodideBaseUrl = "";
      loadedPackages.clear();
      preferLocalPyodide = false;
      try {
        const cdnPyodide = await getPyodide();
        await cdnPyodide.loadPackage(missing);
        missing.forEach((name) => loadedPackages.add(name));
        return;
      } catch (cdnErr) {
        throw new Error(
          `Pyodide 패키지 로드 실패: ${missing.join(", ")}\n로컬 패키지와 CDN fallback이 모두 실패했습니다.\nlocal: ${localError}\ncdn: ${String(cdnErr)}`,
        );
      }
    }
    throw new Error(
      `Pyodide 패키지 로드 실패: ${missing.join(", ")}\n네트워크 상태를 확인하거나 로컬/Colab 실행을 사용하세요.\n${String(err)}`,
    );
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer = 0;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timer = window.setTimeout(() => {
        reject(new Error(`Python 실행 시간이 ${timeoutMs}ms를 초과했습니다. 반복문 조건이나 큰 학습 루프를 확인하세요.`));
      }, timeoutMs);
    }),
  ]).finally(() => window.clearTimeout(timer));
}

function injectMatplotlibHints(code: string): string {
  const preamble = [
    "import matplotlib",
    "matplotlib.use('Agg', force=True)",
  ];
  const postamble = [
    "",
    "try:",
    "    import matplotlib.pyplot as _codex_plt",
    "    _codex_figs = _codex_plt.get_fignums()",
    "    if _codex_figs:",
    "        print(f\"[matplotlib] figure {_codex_figs} created. 브라우저 출력 패널은 이미지를 직접 표시하지 않습니다. plt.savefig(...) 또는 Colab/로컬 실행으로 확인하세요.\")",
    "except Exception as _codex_plot_error:",
    "    print(f\"[matplotlib] figure 확인 중 오류: {_codex_plot_error}\")",
  ];
  const lines = code.split("\n");
  let insertAt = 0;
  while (insertAt < lines.length && /^from __future__ import /.test(lines[insertAt].trim())) {
    insertAt += 1;
  }
  return [
    ...lines.slice(0, insertAt),
    ...preamble,
    ...lines.slice(insertAt),
    ...postamble,
  ].join("\n");
}

function prepareCode(code: string, packages: string[]): string {
  return packages.includes("matplotlib") ? injectMatplotlibHints(code) : code;
}

function formatPythonError(err: unknown): string {
  const message = String(err);
  if (message.includes("ModuleNotFoundError")) {
    return `Python import 오류:\n${message}\n💡 힌트: 브라우저 실행기는 NumPy, SciPy, Matplotlib 중심 실습을 지원합니다. PyTorch/ONNX/OpenCV/ROS 2 코드는 로컬 또는 Colab에서 실행하세요.`;
  }
  if (message.includes("SyntaxError")) {
    return `문법 오류 (SyntaxError):\n${message}\n💡 힌트: 괄호 닫기, 따옴표 매칭, if/for 문의 콜론(:) 누락 여부를 확인하세요.`;
  }
  if (message.includes("NameError")) {
    return `변수/함수명 오류 (NameError):\n${message}\n💡 힌트: 정의되지 않은 변수나 함수를 사용했습니다. 이름에 오타가 있는지 확인하세요.`;
  }
  if (message.includes("IndentationError")) {
    return `들여쓰기 오류 (IndentationError):\n${message}\n💡 힌트: 파이썬은 들여쓰기가 매우 중요합니다. 루프나 조건문 내부의 공백/탭을 확인하세요.`;
  }
  if (message.includes("TypeError")) {
    return `타입 오류 (TypeError):\n${message}\n💡 힌트: 잘못된 자료형을 연산하거나 함수에 넘겼습니다. (예: 문자열과 숫자의 덧셈)`;
  }
  return `Python 실행 오류:\n${message}`;
}

export async function runPython(code: string, timeoutMs = DEFAULT_PYTHON_TIMEOUT_MS): Promise<PythonRunResult> {
  const startedAt = performance.now();
  const support = getBrowserPythonSupport(code);
  if (!support.supported) {
    return {
      stdout: "",
      stderr: support.reason ?? "브라우저 Python에서 실행할 수 없는 코드입니다.",
      loadedPackages: [],
      elapsedMs: 0,
    };
  }

  const pyodide = await getPyodide();
  await ensurePackages(pyodide, support.requiredPackages);

  let stdout = "";
  let stderr = "";

  pyodide.setStdout({ batched: (text) => { stdout += text + "\n"; } });
  pyodide.setStderr({ batched: (text) => { stderr += text + "\n"; } });

  try {
    await withTimeout(pyodide.runPythonAsync(prepareCode(code, support.requiredPackages)), timeoutMs);
  } catch (err) {
    stderr += formatPythonError(err);
  }

  if (!stdout.trim() && !stderr.trim()) {
    stdout = "실행은 완료됐지만 print 출력이 없습니다. 값을 확인하려면 print(...)를 추가하세요.";
  }

  return {
    stdout: stdout.trimEnd(),
    stderr: stderr.trimEnd(),
    loadedPackages: support.requiredPackages,
    elapsedMs: performance.now() - startedAt,
  };
}

export function isPyodideLoaded(): boolean {
  return pyodideInstance !== null;
}
