import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, PanelsTopLeft } from "lucide-react";
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
import { VisualizerHub } from "./components/visualizers/VisualizerHub";
import { WrongAnswerNote } from "./components/WrongAnswerNote";
import { curriculum } from "./data/curriculumV2";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { emptyProgress, type ProgressState, type SrsCard, type WrongAnswerEntry } from "./types";

const storageKey = "physical-ai-study-progress-v1";

function App() {
  const [progress, setProgress] = useLocalStorage<ProgressState>(storageKey, emptyProgress);
  const [selectedModuleId, setSelectedModuleId] = useState(curriculum[0].id);
  const [selectedSectionId, setSelectedSectionId] = useState(curriculum[0].sections[0].id);
  const [activeTab, setActiveTab] = useState<ActiveTab>("theory");
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

  const selectModule = (moduleId: string) => {
    const nextModule = curriculum.find((module) => module.id === moduleId) ?? curriculum[0];
    setSelectedModuleId(nextModule.id);
    setSelectedSectionId(nextModule.sections[0].id);
    setActiveTab("theory");
  };

  const logStudy = useCallback((sectionId: string, durationMs = 0) => {
    const today = new Date().toISOString().slice(0, 10);
    setProgress((prev) => ({
      ...prev,
      studyLog: [...(prev.studyLog ?? []), { date: today, sectionId, durationMs }],
    }));
  }, [setProgress]);

  useEffect(() => {
    const previous = visitRef.current;
    if (previous.sectionId !== selectedSectionId) {
      const durationMs = Date.now() - previous.startedAt;
      if (durationMs > 5000) logStudy(previous.sectionId, durationMs);
      visitRef.current = { sectionId: selectedSectionId, startedAt: Date.now() };
    }
  }, [logStudy, selectedSectionId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedSectionId]);

  const toggleSection = (sectionId: string) => {
    setProgress((prev) => ({
      ...prev,
      completedSections: {
        ...prev.completedSections,
        [sectionId]: !prev.completedSections[sectionId],
      },
    }));
    logStudy(sectionId);
  };

  const toggleChecklist = (sectionId: string, itemIndex: number) => {
    setProgress((prev) => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [sectionId]: {
          ...(prev.checklist[sectionId] ?? {}),
          [itemIndex]: !(prev.checklist[sectionId] ?? {})[itemIndex],
        },
      },
    }));
  };

  const saveUserCode = (sectionId: string, language: "cpp" | "python", code: string) => {
    setProgress((prev) => ({
      ...prev,
      userCode: {
        ...(prev.userCode ?? {}),
        [sectionId]: {
          ...((prev.userCode ?? {})[sectionId] ?? {}),
          [`${sectionId}:${language}`]: code,
        },
      },
    }));
  };

  const saveQuizAnswer = (sectionId: string, questionId: string, answer: string) => {
    setProgress((prev) => ({
      ...prev,
      quizAnswers: {
        ...(prev.quizAnswers ?? {}),
        [sectionId]: {
          ...((prev.quizAnswers ?? {})[sectionId] ?? {}),
          [questionId]: answer,
        },
      },
    }));
  };

  const resetQuizAnswers = (sectionId: string) => {
    setProgress((prev) => {
      const nextAnswers = { ...(prev.quizAnswers ?? {}) };
      delete nextAnswers[sectionId];
      return {
        ...prev,
        quizAnswers: nextAnswers,
      };
    });
  };

  const saveQuizScore = (sectionId: string, score: number) => {
    const today = new Date().toISOString().slice(0, 10);
    setProgress((prev) => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [sectionId]: Math.max(prev.quizScores[sectionId] ?? 0, score),
      },
      quizHistory: [...(prev.quizHistory ?? []), { date: today, sectionId, score }],
    }));
    logStudy(sectionId);
  };

  const saveNote = useCallback((sectionId: string, note: string) => {
    setProgress((prev) => ({
      ...prev,
      notes: {
        ...(prev.notes ?? {}),
        [sectionId]: note,
      },
    }));
  }, [setProgress]);

  const updateSrsCard = useCallback((cardId: string, card: SrsCard) => {
    setProgress((prev) => ({
      ...prev,
      srsCards: {
        ...(prev.srsCards ?? {}),
        [cardId]: card,
      },
    }));
  }, [setProgress]);

  const recordWrongAnswers = useCallback((entries: WrongAnswerEntry[]) => {
    if (entries.length === 0) return;
    setProgress((prev) => ({
      ...prev,
      wrongAnswers: Array.from(
        new Map(
          [...(prev.wrongAnswers ?? []), ...entries]
            .slice(-300)
            .map((entry) => [`${entry.date}:${entry.sectionId}:${entry.questionId}:${entry.myAnswer}`, entry]),
        ).values(),
      ).slice(-250),
    }));
  }, [setProgress]);

  const resetProgress = () => {
    const ok = window.confirm("저장된 진행도와 퀴즈 점수를 초기화할까요?");
    if (ok) {
      Object.keys(window.localStorage)
        .filter((key) => key.startsWith("physical-ai-js-lab:"))
        .forEach((key) => window.localStorage.removeItem(key));
      setProgress(emptyProgress);
    }
  };

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

        <div className="tab-body">
          {activeTab === "theory" && (
            <>
              <TheoryPanel section={currentSection} />
              <NotesEditor
                sectionId={currentSection.id}
                value={(progress.notes ?? {})[currentSection.id] ?? ""}
                onSave={saveNote}
              />
            </>
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
          {activeTab === "visual" && <VisualizerHub id={currentSection.visualizerId} section={currentSection} />}
        </div>
      </main>

      <aside className="right-column">
        <ProgressPanel
          currentModule={currentModule}
          currentSection={currentSection}
          modules={curriculum}
          onImport={setProgress}
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

export default App;
