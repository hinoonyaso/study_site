import { useMemo, useState } from "react";
import { ExternalLink, Library, Search } from "lucide-react";
import { sourceCatalog, sourceCatalogDomains } from "../data/sourceCatalog";
import type { LessonSection } from "../types";

type SourceCatalogPanelProps = {
  section: LessonSection;
};

export function SourceCatalogPanel({ section }: SourceCatalogPanelProps) {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("현재 세션");
  const sectionIds = new Set(section.sourceIds ?? section.theory.flatMap((unit) => unit.sourceIds));

  const sources = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sourceCatalog
      .filter((source) => {
        const domainMatch =
          domain === "전체" || (domain === "현재 세션" ? sectionIds.has(source.id) : source.domain === domain);
        if (!domainMatch) return false;
        if (q.length < 2) return true;
        return [
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
          .toLowerCase()
          .includes(q);
      })
      .slice(0, 18);
  }, [domain, query, sectionIds]);

  return (
    <section className="source-catalog-panel">
      <div className="panel-heading">
        <Library size={18} aria-hidden />
        <h2>공식 자료실</h2>
      </div>
      <div className="source-catalog-controls">
        <label>
          <span>범위</span>
          <select onChange={(event) => setDomain(event.target.value)} value={domain}>
            <option>현재 세션</option>
            <option>전체</option>
            {sourceCatalogDomains.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span>
            <Search size={13} aria-hidden />
            검색
          </span>
          <input onChange={(event) => setQuery(event.target.value)} placeholder="OpenStax, QoS, ONNX..." value={query} />
        </label>
      </div>
      <div className="source-count">
        {sourceCatalog.length}개 자료 중 {sources.length}개 표시
      </div>
      <div className="source-catalog-list">
        {sources.map((source) => (
          <a href={source.url} key={source.id} rel="noreferrer" target="_blank">
            <span>{source.domain}</span>
            <strong>{source.title}</strong>
            <small>
              {source.level} · {source.sourceType}
            </small>
            <p>{source.note}</p>
            <ExternalLink size={14} aria-hidden />
          </a>
        ))}
      </div>
    </section>
  );
}
