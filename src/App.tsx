import { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronDown,
  Compass,
  Cpu,
  Columns,
  PanelsTopLeft,
  Route,
  X,
} from "lucide-react";
import { FlashcardPanel } from "./components/FlashcardPanel";
import { NotesEditor } from "./components/NotesEditor";
import { PomodoroTimer } from "./components/PomodoroTimer";
import { ProgressPanel } from "./components/ProgressPanel";
import { PracticePanel } from "./components/PracticePanel";
import { QuizPanel } from "./components/QuizPanel";
import { SectionTabs, type ActiveTab } from "./components/SectionTabs";
import { Sidebar } from "./components/Sidebar";
import { SourceCatalogPanel } from "./components/SourceCatalogPanel";
import { StatsPanel } from "./components/StatsPanel";
import { TheoryPanel } from "./components/TheoryPanel";
import { ThemeToggle, useTheme } from "./components/ThemeToggle";
const VisualizerHub = lazy(() => import("./components/visualizers/VisualizerHub").then(module => ({ default: module.VisualizerHub })));
import { WrongAnswerNote } from "./components/WrongAnswerNote";
import { curriculum } from "./data/core/curriculumV2";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { ProgressProvider, useProgress } from "./contexts/ProgressContext";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { emptyProgress, type ProgressState, type SrsCard, type WrongAnswerEntry } from "./types";

const storageKey = "physical-ai-study-progress-v1";
const onboardingKey = "physical-ai-onboarding-seen-v1";

function AppContent() {
  const { progress, isLoaded, logStudy, toggleSection, toggleChecklist, saveUserCode, saveQuizAnswer, resetQuizAnswers, saveQuizScore, saveNote, updateSrsCard, recordWrongAnswers, clearWrongAnswers, resetProgress, overwriteProgress } = useProgress();

  if (!isLoaded) return <div className="app-shell" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>데이터 불러오는 중...</div>;
  const [selectedModuleId, setSelectedModuleId] = useState(curriculum[0].id);
  const [selectedSectionId, setSelectedSectionId] = useState(curriculum[0].sections[0].id);
  const [activeTab, setActiveTab] = useState<ActiveTab>("theory");
  const [splitMode, setSplitMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => window.localStorage.getItem(onboardingKey) !== "1");
  const visitRef = useRef({ sectionId: curriculum[0].sections[0].id, startedAt: Date.now() });
  const { theme, toggle: toggleTheme } = useTheme();

  const currentModule = useMemo(
    () => curriculum.find((module) => module.id === selectedModuleId) ?? curriculum[0],
    [selectedModuleId],
  );
  const currentSection = useMemo(
    () => currentModule.sections.find((section) => section.id === selectedSectionId) ?? currentModule.sections[0],
    [currentModule, selectedSectionId],
  );

  const allSections = useMemo(() => curriculum.flatMap((m) => m.sections), []);
  const completedSectionCount = useMemo(
    () => allSections.filter((section) => progress.completedSections[section.id]).length,
    [allSections, progress.completedSections],
  );
  const totalCompletion = Math.round((completedSectionCount / allSections.length) * 100);
  const currentModuleDone = currentModule.sections.filter((section) => progress.completedSections[section.id]).length;
  const currentModuleCompletion = Math.round((currentModuleDone / currentModule.sections.length) * 100);
  const currentSectionIndex = useMemo(
    () => allSections.findIndex((section) => section.id === currentSection.id),
    [allSections, currentSection.id],
  );
  const previousSection = currentSectionIndex > 0 ? allSections[currentSectionIndex - 1] : undefined;
  const nextSection = currentSectionIndex >= 0 && currentSectionIndex < allSections.length - 1 ? allSections[currentSectionIndex + 1] : undefined;

  const selectModule = (moduleId: string) => {
    const nextModule = curriculum.find((module) => module.id === moduleId) ?? curriculum[0];
    setSelectedModuleId(nextModule.id);
    setSelectedSectionId(nextModule.sections[0].id);
    setActiveTab("theory");
  };

  const navigateToFirstMatch = useCallback(
    (predicate: (sectionId: string, title: string, moduleTitle: string) => boolean) => {
      for (const module of curriculum) {
        const section = module.sections.find((candidate) => predicate(candidate.id, candidate.title, module.title));
        if (section) {
          setSelectedModuleId(module.id);
          setSelectedSectionId(section.id);
          setActiveTab("theory");
          break;
        }
      }
    },
    [],
  );

  const dismissOnboarding = useCallback(() => {
    window.localStorage.setItem(onboardingKey, "1");
    setShowOnboarding(false);
  }, []);

  const jumpToFirstMatch = useCallback(
    (predicate: (sectionId: string, title: string, moduleTitle: string) => boolean) => {
      navigateToFirstMatch(predicate);
      dismissOnboarding();
    },
    [dismissOnboarding, navigateToFirstMatch],
  );

  // Keyboard shortcuts
  const goNextSection = useCallback(() => {
    const idx = allSections.findIndex((s) => s.id === selectedSectionId);
    if (idx < allSections.length - 1) {
      const next = allSections[idx + 1];
      const parentModule = curriculum.find((m) => m.sections.some((s) => s.id === next.id));
      if (parentModule) {
        setSelectedModuleId(parentModule.id);
        setSelectedSectionId(next.id);
      }
    }
  }, [allSections, selectedSectionId]);

  const goPrevSection = useCallback(() => {
    const idx = allSections.findIndex((s) => s.id === selectedSectionId);
    if (idx > 0) {
      const prev = allSections[idx - 1];
      const parentModule = curriculum.find((m) => m.sections.some((s) => s.id === prev.id));
      if (parentModule) {
        setSelectedModuleId(parentModule.id);
        setSelectedSectionId(prev.id);
      }
    }
  }, [allSections, selectedSectionId]);

  useKeyboardShortcuts({
    setTab: setActiveTab,
    nextSection: goNextSection,
    prevSection: goPrevSection,
    executeAction: () => {
      if (activeTab === "quiz") window.dispatchEvent(new Event("physical-ai:submit-quiz"));
      if (activeTab === "practice") window.dispatchEvent(new Event("physical-ai:run-js-lab"));
    },
  });

  return (
    <div className="app-shell">
      {showOnboarding && (
        <div className="onboarding-backdrop" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
          <div className="onboarding-modal">
            <button className="onboarding-close" onClick={dismissOnboarding} type="button" aria-label="온보딩 닫기">
              <X size={18} aria-hidden />
            </button>
            <div className="onboarding-heading">
              <Compass size={24} aria-hidden />
              <div>
                <span className="eyebrow">처음 시작하기</span>
                <h2 id="onboarding-title">목표를 고르면 첫 세션으로 바로 이동합니다</h2>
                <p>
                  이 사이트는 이론, 코드 실습, 시험, 시각화를 같은 세션 안에서 묶습니다. 진행률은 브라우저에 저장되며,
                  우측 패널에서 JSON으로 내보내 백업할 수 있습니다.
                </p>
              </div>
            </div>
            <div className="onboarding-options">
              <button className="onboarding-card" onClick={dismissOnboarding} type="button">
                <BookOpen size={20} aria-hidden />
                <strong>전체 커리큘럼</strong>
                <span>Part 1부터 차근차근 시작</span>
              </button>
              <button
                className="onboarding-card"
                onClick={() =>
                  jumpToFirstMatch((id, title) =>
                    id.includes("fk_matrix_ik_singularity") || id.includes("dh_craig") || title.includes("Jacobian"),
                  )
                }
                type="button"
              >
                <Bot size={20} aria-hidden />
                <strong>로봇팔 제어</strong>
                <span>FK/IK/Jacobian 직관부터 시작</span>
              </button>
              <button
                className="onboarding-card"
                onClick={() => jumpToFirstMatch((id) => id.includes("bicycle_model_stanley") || id.includes("ekf_chi_squared"))}
                type="button"
              >
                <Route size={20} aria-hidden />
                <strong>자율주행</strong>
                <span>Bicycle/Stanley/EKF 진단으로 이동</span>
              </button>
              <button
                className="onboarding-card"
                onClick={() =>
                  jumpToFirstMatch((id, title, moduleTitle) =>
                    id.includes("dataset_label_split") || moduleTitle.includes("인식 AI") || title.includes("데이터셋"),
                  )
                }
                type="button"
              >
                <Cpu size={20} aria-hidden />
                <strong>AI·배포</strong>
                <span>데이터셋 품질과 confusion matrix부터 시작</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <Sidebar
        modules={curriculum}
        onSelectModule={selectModule}
        onSelectSection={(moduleId, sectionId) => {
          setSelectedModuleId(moduleId);
          setSelectedSectionId(sectionId);
          setActiveTab("theory");
        }}
        progress={progress}
        selectedModuleId={selectedModuleId}
        selectedSectionId={selectedSectionId}
      />

      <main className="main-area">
        <header className="topbar">
          <div>
            <div className="eyebrow">
              <PanelsTopLeft size={16} aria-hidden />
              PDF 기반 개인 커리큘럼
            </div>
            <h1>{currentModule.title}</h1>
            <p>{currentModule.summary}</p>
          </div>
          <div className="topbar-actions">
            <button className={`icon-button text-button ${splitMode ? "is-active" : ""}`} onClick={() => setSplitMode(s => !s)} title="분할 뷰 토글" type="button">
              <Columns size={15} aria-hidden />
              {splitMode ? "단일 뷰" : "좌우 분할"}
            </button>
            <PomodoroTimer onSessionComplete={() => logStudy(currentSection.id, 25 * 60 * 1000)} />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <label className="section-select">
              <span>
                <ChevronDown size={15} aria-hidden />
                섹션
              </span>
              <select
                onChange={(event) => {
                  setSelectedSectionId(event.target.value);
                  setActiveTab("theory");
                }}
                value={currentSection.id}
              >
                {currentModule.sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        <div className="beginner-guide-banner">
          <div className="banner-icon">💡</div>
          <div className="banner-text">
            <strong>무엇부터 시작해야 할지 모르시겠나요?</strong>
            <span>Physical AI Lab이 처음이시라면 아래 로드맵의 <strong>[기초수학]</strong>부터 차근차근 시작해보세요.</span>
          </div>
          <button
            className="primary-button"
            onClick={() =>
              navigateToFirstMatch((id, title) =>
                id.includes("vector_matrix_inverse") || id.includes("laplace") || title.includes("기초"),
              )
            }
            type="button"
          >
            입문자 가이드 시작
          </button>
        </div>

        <section className="study-roadmap" aria-label="전체 학습 로드맵">
          <div className="roadmap-intro">
            <div>
              <div className="eyebrow">
                <Compass size={16} aria-hidden />
                Physical AI 학습 경로
              </div>
              <h2>수학 → 로봇수학 → 제어 → 자율주행 → AI/VLA → 실전 프로젝트</h2>
              <p>
                목적별 진입점을 고르거나 아래 Part 로드맵에서 현재 위치와 완료율을 확인할 수 있습니다.
              </p>
            </div>
            <div className="mobile-progress-summary" aria-label="전체 진행률 요약">
              <strong>{totalCompletion}%</strong>
              <span>
                전체 {completedSectionCount}/{allSections.length} · 현재 Part {currentModuleCompletion}%
              </span>
            </div>
          </div>

          <div className="goal-presets" aria-label="목표별 빠른 시작">
            <button className="goal-preset" onClick={() => selectModule(curriculum[0].id)} type="button">
              <BookOpen size={18} aria-hidden />
              <span>
                <strong>전체</strong>
                <small>Part 1부터</small>
              </span>
            </button>
            <button
              className="goal-preset"
              onClick={() =>
                navigateToFirstMatch((id, title) =>
                  id.includes("vector_matrix_inverse") || id.includes("laplace") || title.includes("기초"),
                )
              }
              type="button"
            >
              <Compass size={18} aria-hidden />
              <span>
                <strong>기초수학</strong>
                <small>벡터·행렬부터</small>
              </span>
            </button>
            <button
              className="goal-preset"
              onClick={() =>
                navigateToFirstMatch((id, title) =>
                  id.includes("fk_matrix_ik_singularity") || id.includes("geometric_vs_analytic") || title.includes("Jacobian"),
                )
              }
              type="button"
            >
              <Bot size={18} aria-hidden />
              <span>
                <strong>로봇팔</strong>
                <small>FK/IK/Jacobian</small>
              </span>
            </button>
            <button
              className="goal-preset"
              onClick={() => navigateToFirstMatch((id) => id.includes("bicycle_model_stanley") || id.includes("ekf_chi_squared"))}
              type="button"
            >
              <Route size={18} aria-hidden />
              <span>
                <strong>자율주행</strong>
                <small>Stanley/EKF</small>
              </span>
            </button>
            <button
              className="goal-preset"
              onClick={() =>
                navigateToFirstMatch((id, title, moduleTitle) =>
                  id.includes("ros2_cli_command") || moduleTitle.includes("ROS") || title.includes("ROS"),
                )
              }
              type="button"
            >
              <PanelsTopLeft size={18} aria-hidden />
              <span>
                <strong>ROS 2</strong>
                <small>명령어·노드</small>
              </span>
            </button>
            <button
              className="goal-preset"
              onClick={() =>
                navigateToFirstMatch((id, title, moduleTitle) =>
                  id.includes("dataset_label_split") || moduleTitle.includes("인식 AI") || title.includes("VLM"),
                )
              }
              type="button"
            >
              <Cpu size={18} aria-hidden />
              <span>
                <strong>AI/VLA</strong>
                <small>데이터·배포</small>
              </span>
            </button>
          </div>

          <div className="roadmap-steps" aria-label="Part별 완료율">
            {curriculum.map((module, index) => {
              const done = module.sections.filter((section) => progress.completedSections[section.id]).length;
              const percent = Math.round((done / module.sections.length) * 100);
              const shortTitle = module.title.replace(/^Part\s+\d+\.\s*/, "");
              return (
                <button
                  aria-label={`로드맵 항목 ${index + 1}: ${percent}% 완료`}
                  className={`roadmap-step ${module.id === selectedModuleId ? "is-active" : ""}`}
                  key={module.id}
                  onClick={() => selectModule(module.id)}
                  type="button"
                >
                  <span className="roadmap-index">Part {index + 1}</span>
                  <strong>{shortTitle}</strong>
                  <span className="roadmap-meta">
                    {done}/{module.sections.length} · {percent}%
                  </span>
                  <span className="roadmap-bar" aria-hidden>
                    <span style={{ width: `${percent}%` }} />
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="lesson-header">
          <div>
            <span className="lesson-kicker">{currentModule.title}</span>
            <h2>{currentSection.title}</h2>
          </div>
          <button
            className={progress.completedSections[currentSection.id] ? "complete-button is-done" : "complete-button"}
            onClick={() => toggleSection(currentSection.id)}
            type="button"
          >
            <CheckCircle2 size={17} aria-hidden />
            {progress.completedSections[currentSection.id] ? "완료됨" : "완료 표시"}
          </button>
        </section>

        <SectionTabs activeTab={activeTab} onChange={setActiveTab} />

        <div className={`tab-body ${splitMode ? "split-mode-active" : ""}`}>
          {(activeTab === "theory" || splitMode) && (
            <div className="split-left">
              <TheoryPanel section={currentSection} />
              <NotesEditor
                sectionId={currentSection.id}
                value={(progress.notes ?? {})[currentSection.id] ?? ""}
                onSave={saveNote}
              />
            </div>
          )}
          
          <div className="split-right">
            {splitMode && activeTab === "theory" && (
              <div className="split-placeholder" style={{ padding: "40px", textAlign: "center", color: "var(--muted)", border: "1px dashed var(--line)", borderRadius: "8px", marginTop: "18px" }}>
                상단 탭에서 실습, 문제, 시각화를 선택해 좌우 분할 모드로 학습하세요.
              </div>
            )}
            {activeTab === "practice" && (
              <PracticePanel
                onSaveCode={(language, code) => saveUserCode(currentSection.id, language, code)}
                savedCode={(progress.userCode ?? {})[currentSection.id] ?? {}}
                section={currentSection}
              />
            )}
            {activeTab === "quiz" && (
              <QuizPanel
                bestScore={progress.quizScores[currentSection.id] ?? 0}
                onSaveAnswer={(questionId, answer) => saveQuizAnswer(currentSection.id, questionId, answer)}
                onResetAnswers={() => resetQuizAnswers(currentSection.id)}
                onRecordWrongAnswers={recordWrongAnswers}
                onSaveScore={(score) => saveQuizScore(currentSection.id, score)}
                savedAnswers={(progress.quizAnswers ?? {})[currentSection.id] ?? {}}
                section={currentSection}
              />
            )}
            {activeTab === "visual" && (
              <Suspense fallback={<div className="loading-state" style={{ padding: "2rem", textAlign: "center" }}>시각화 도구를 불러오는 중...</div>}>
                <VisualizerHub id={currentSection.visualizerId} section={currentSection} />
              </Suspense>
            )}
          </div>
        </div>

        <nav className="session-nav" aria-label="세션 이동">
          <button className="nav-step-button" disabled={!previousSection} onClick={goPrevSection} type="button">
            <ArrowLeft size={20} aria-hidden />
            <div className="nav-text-block">
              <small>이전 세션</small>
              <strong>{previousSection?.title ?? "첫 세션"}</strong>
            </div>
          </button>
          <div className="session-nav-progress">
            <strong>{currentSectionIndex + 1}</strong>
            <span>/ {allSections.length}</span>
          </div>
          <button className="nav-step-button is-next" disabled={!nextSection} onClick={goNextSection} type="button">
            <div className="nav-text-block">
              <small>다음 세션</small>
              <strong>{nextSection?.title ?? "마지막 세션"}</strong>
            </div>
            <ArrowRight size={20} aria-hidden />
          </button>
        </nav>
      </main>

      <aside className="right-column">
        <ProgressPanel
          currentModule={currentModule}
          currentSection={currentSection}
          modules={curriculum}
          onImport={overwriteProgress}
          onReset={resetProgress}
          onToggleChecklist={toggleChecklist}
          onToggleSection={toggleSection}
          progress={progress}
        />
        <SourceCatalogPanel section={currentSection} />
        <StatsPanel modules={curriculum} progress={progress} />
        <FlashcardPanel modules={curriculum} progress={progress} onUpdateCard={updateSrsCard} />
        <WrongAnswerNote modules={curriculum} wrongAnswers={progress.wrongAnswers ?? []} />
      </aside>
    </div>
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <AppContent />
    </ProgressProvider>
  );
}
