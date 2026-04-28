declare global {
  interface Window {
    loadPyodide: (options: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

interface PyodideInterface {
  loadPackage: (packages: string[]) => Promise<void>;
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (options: { batched: (text: string) => void }) => void;
  setStderr: (options: { batched: (text: string) => void }) => void;
}

let pyodideInstance: PyodideInterface | null = null;
let loadingPromise: Promise<PyodideInterface> | null = null;

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/";

async function getPyodide(): Promise<PyodideInterface> {
  if (pyodideInstance) return pyodideInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    await new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${PYODIDE_CDN}pyodide.js"]`)) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = `${PYODIDE_CDN}pyodide.js`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Pyodide 스크립트 로드 실패"));
      document.head.appendChild(script);
    });

    const pyodide = await window.loadPyodide({ indexURL: PYODIDE_CDN });
    await pyodide.loadPackage(["numpy"]);
    pyodideInstance = pyodide;
    return pyodide;
  })();

  return loadingPromise;
}

export async function runPython(code: string): Promise<{ stdout: string; stderr: string }> {
  const pyodide = await getPyodide();

  let stdout = "";
  let stderr = "";

  pyodide.setStdout({ batched: (text) => { stdout += text + "\n"; } });
  pyodide.setStderr({ batched: (text) => { stderr += text + "\n"; } });

  try {
    await pyodide.runPythonAsync(code);
  } catch (err) {
    stderr += String(err);
  }

  return { stdout: stdout.trimEnd(), stderr: stderr.trimEnd() };
}

export function isPyodideLoaded(): boolean {
  return pyodideInstance !== null;
}
