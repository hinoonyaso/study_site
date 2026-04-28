const COMPILER = { id: "g132", options: "-std=c++17 -O2", libs: [{ id: "eigen", version: "337" }] };

export async function openInGodbolt(code: string): Promise<void> {
  try {
    const response = await fetch("https://godbolt.org/api/shortener", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessions: [{
          id: 1,
          language: "c++",
          source: code,
          compilers: [COMPILER],
          // executors 포함 시 Godbolt가 실행 결과(stdout) 패널을 함께 열어줌
          executors: [{ compiler: COMPILER }],
        }],
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as { url: string };
    // API가 반환하는 url은 full URL("https://godbolt.org/z/ID") 또는 ID 형태
    const raw = data.url.trim();
    const target = raw.startsWith("http") ? raw : `https://godbolt.org/z/${raw}`;
    window.open(target, "_blank", "noopener");
  } catch {
    // API 실패 시 클립보드 복사 + 기본 C++ 편집기 열기
    try { await navigator.clipboard.writeText(code); } catch { /* ignore */ }
    window.open("https://godbolt.org/?lang=c%2B%2B&libs=eigen:337", "_blank", "noopener");
  }
}
