import { useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { sourceCatalog } from "../data/core/sourceCatalog";
import type { CurriculumModule } from "../types";

type SearchBarProps = {
  modules: CurriculumModule[];
  onSelect: (moduleId: string, sectionId: string) => void;
};

type SearchResult = {
  kind: "section" | "source";
  moduleId: string;
  moduleTitle: string;
  sectionId?: string;
  sectionTitle: string;
  matchContext: string;
  isTitleMatch: boolean;
  url?: string;
};

export function SearchBar({ modules, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const hits: SearchResult[] = [];
    for (const module of modules) {
      for (const section of module.sections) {
        const searchable = [
          module.title,
          module.summary,
          section.title,
          section.focus,
          section.groupTitle ?? "",
          ...section.theory.map((u) => u.title),
          ...section.theory.map((u) => u.summary),
          ...section.theory.flatMap((u) => u.details),
          ...section.theory.flatMap((u) => u.derivation),
          ...section.theory.flatMap((u) => u.proof),
          ...section.theory.flatMap((u) => u.formulas.map((f) => f.label)),
          ...section.theory.flatMap((u) => u.formulas.map((f) => f.expression)),
          ...section.theory.flatMap((u) => u.formulas.map((f) => f.description)),
          ...section.quiz.map((q) => q.prompt),
          ...section.quiz.map((q) => q.explanation),
          ...section.quiz.flatMap((q) => q.formulaSymbols ?? []),
          ...section.checklist,
          ...(section.cheats ?? []).map((cheat) => `${cheat.label} ${cheat.command} ${cheat.description}`),
          ...(section.resources ?? []).map((resource) => `${resource.title} ${resource.domain} ${resource.note}`),
          ...(section.sourceIds ?? []),
        ]
          .join(" ")
          .toLowerCase();

        if (searchable.includes(q)) {
          // Find the matching fragment for context
          const idx = searchable.indexOf(q);
          const start = Math.max(0, idx - 20);
          const end = Math.min(searchable.length, idx + q.length + 30);
          const matchContext =
            (start > 0 ? "…" : "") + searchable.slice(start, end).trim() + (end < searchable.length ? "…" : "");

          hits.push({
            kind: "section",
            moduleId: module.id,
            moduleTitle: module.title,
            sectionId: section.id,
            sectionTitle: section.title,
            matchContext,
            isTitleMatch: section.title.toLowerCase().includes(q) || (section.groupTitle?.toLowerCase().includes(q) ?? false),
          });
        }
        if (hits.length >= 15) break;
      }
      if (hits.length >= 15) break;
    }
    for (const source of sourceCatalog) {
      if (hits.length >= 20) break;
      const searchable = [
        source.title,
        source.url,
        source.domain,
        source.level,
        source.sourceType,
        source.note,
        ...source.tags,
        ...source.recommendedFor,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) continue;
      const idx = searchable.indexOf(q);
      const start = Math.max(0, idx - 20);
      const end = Math.min(searchable.length, idx + q.length + 30);
      hits.push({
        kind: "source",
        moduleId: "source-catalog",
        moduleTitle: `${source.domain} · ${source.sourceType}`,
        sectionTitle: source.title,
        matchContext: (start > 0 ? "…" : "") + searchable.slice(start, end).trim() + (end < searchable.length ? "…" : ""),
        isTitleMatch: source.title.toLowerCase().includes(q),
        url: source.url,
      });
    }
    return hits.sort((a, b) => {
      const aq = a.sectionTitle.toLowerCase().includes(q) ? 0 : a.matchContext.includes(q) ? 1 : 2;
      const bq = b.sectionTitle.toLowerCase().includes(q) ? 0 : b.matchContext.includes(q) ? 1 : 2;
      return aq - bq;
    }).slice(0, 20);
  }, [query, modules]);

  const handleSelect = (result: SearchResult) => {
    if (result.kind === "source" && result.url) {
      window.open(result.url, "_blank", "noopener,noreferrer");
      setIsOpen(false);
      return;
    }
    if (!result.sectionId) return;
    onSelect(result.moduleId, result.sectionId);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const clear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="search-bar-wrap">
      <div className="search-input-row">
        <Search size={15} aria-hidden />
        <input
          ref={inputRef}
          aria-label="커리큘럼 검색"
          className="search-input"
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="세션 제목, 개념 검색 (예: Jacobian, EKF)"
          type="search"
          value={query}
        />
        {query && (
          <button aria-label="검색어 지우기" className="search-clear" onClick={clear} type="button">
            <X size={14} aria-hidden />
          </button>
        )}
      </div>
      {isOpen && results.length > 0 && (
        <div className="search-dropdown">
          {results.map((r) => (
            <button
              className="search-result"
              key={`${r.moduleId}:${r.sectionId ?? r.url}`}
              onClick={() => handleSelect(r)}
              type="button"
            >
              <span className="search-module">
                {r.moduleTitle}
                {r.kind !== "source" && (
                  <span className={`search-badge ${r.isTitleMatch ? "badge-title" : "badge-content"}`}>
                    {r.isTitleMatch ? "제목 매칭" : "내용 매칭"}
                  </span>
                )}
              </span>
              <strong>{r.sectionTitle}</strong>
              <small>{r.kind === "source" ? "공식자료 · 새 탭으로 열기" : r.matchContext}</small>
            </button>
          ))}
        </div>
      )}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="search-dropdown">
          <div className="search-empty">결과 없음</div>
        </div>
      )}
      {/* Backdrop to close dropdown */}
      {isOpen && query.length >= 2 && (
        <div aria-hidden className="search-backdrop" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
