import { useRef } from "react";
import type { CSSProperties } from "react";
import { BarChart3, CheckSquare, Download, RefreshCw, Upload } from "lucide-react";
import { emptyProgress, type CurriculumModule, type LessonSection, type ProgressState } from "../types";

type ProgressPanelProps = {
  modules: CurriculumModule[];
  currentModule: CurriculumModule;
  currentSection: LessonSection;
  progress: ProgressState;
  onToggleSection: (sectionId: string) => void;
  onToggleChecklist: (sectionId: string, itemIndex: number) => void;
  onReset: () => void;
  onImport: (data: ProgressState) => void;
};

export function ProgressPanel({
  modules,
  currentModule,
  currentSection,
  progress,
  onToggleSection,
  onToggleChecklist,
  onReset,
  onImport,
}: ProgressPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const allSections = modules.flatMap((module) => module.sections);
  const completedCount = allSections.filter((section) => progress.completedSections[section.id]).length;
  const completion = Math.round((completedCount / allSections.length) * 100);
  const moduleAverage = Math.round(
    currentModule.sections.reduce((sum, section) => sum + (progress.quizScores[section.id] ?? 0), 0) /
      currentModule.sections.length,
  );
  const sectionChecklist = progress.checklist[currentSection.id] ?? {};

  const normalizeProgress = (raw: Partial<ProgressState>): ProgressState => ({
    ...emptyProgress,
    ...raw,
    completedSections: raw.completedSections ?? {},
    quizScores: raw.quizScores ?? {},
    checklist: raw.checklist ?? {},
    userCode: raw.userCode ?? {},
    quizAnswers: raw.quizAnswers ?? {},
    notes: raw.notes ?? {},
    srsCards: raw.srsCards ?? {},
    studyLog: Array.isArray(raw.studyLog) ? raw.studyLog : [],
    quizHistory: Array.isArray(raw.quizHistory) ? raw.quizHistory : [],
    wrongAnswers: Array.isArray(raw.wrongAnswers) ? raw.wrongAnswers : [],
  });

  const handleExport = () => {
    const payload = {
      appVersion: "physical-ai-study-lab-v5",
      exportedAt: new Date().toISOString(),
      progress,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `physical-ai-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as { progress?: Partial<ProgressState> } & Partial<ProgressState>;
        const data = parsed.progress ?? parsed;
        if (data.completedSections || data.quizScores || data.notes || data.srsCards) {
          onImport(normalizeProgress(data));
          alert("진행도를 성공적으로 불러왔습니다!");
        } else {
          alert("유효하지 않은 파일 형식입니다.");
        }
      } catch {
        alert("JSON 파싱 오류입니다.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <aside className="progress-panel" aria-label="진행도">
      <section className="panel">
        <div className="panel-heading">
          <BarChart3 size={18} aria-hidden />
          <h2>진행도</h2>
        </div>
        <div className="progress-ring" style={{ "--value": `${completion}%` } as CSSProperties}>
          <strong>{completion}%</strong>
          <span>
            {completedCount}/{allSections.length} 섹션
          </span>
        </div>
        <div className="metric-row">
          <span>현재 모듈 평균</span>
          <strong>{Number.isNaN(moduleAverage) ? 0 : moduleAverage}점</strong>
        </div>
        <label className="done-toggle">
          <input
            checked={Boolean(progress.completedSections[currentSection.id])}
            onChange={() => onToggleSection(currentSection.id)}
            type="checkbox"
          />
          <span>이 섹션 학습 완료</span>
        </label>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <CheckSquare size={18} aria-hidden />
          <h2>체크리스트</h2>
        </div>
        <div className="checklist">
          {currentSection.checklist.map((item, index) => (
            <label key={item}>
              <input
                checked={Boolean(sectionChecklist[index])}
                onChange={() => onToggleChecklist(currentSection.id, index)}
                type="checkbox"
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="data-actions">
        <button className="icon-button" onClick={handleExport} type="button">
          <Download size={15} aria-hidden />
          내보내기
        </button>
        <button className="icon-button" onClick={() => fileRef.current?.click()} type="button">
          <Upload size={15} aria-hidden />
          불러오기
        </button>
        <input
          ref={fileRef}
          accept=".json"
          hidden
          onChange={handleImport}
          type="file"
        />
      </div>

      <button className="icon-button reset-button" onClick={onReset} type="button">
        <RefreshCw size={16} aria-hidden />
        진행도 초기화
      </button>
    </aside>
  );
}
