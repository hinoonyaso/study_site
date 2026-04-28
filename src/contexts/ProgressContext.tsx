import React, { createContext, useCallback, useContext } from "react";
import { useIndexedDB } from "../hooks/useIndexedDB";
import { emptyProgress, type ProgressState, type SrsCard, type WrongAnswerEntry } from "../types";

interface ProgressContextValue {
  progress: ProgressState;
  isLoaded: boolean;
  logStudy: (sectionId: string, durationMs?: number) => void;
  toggleSection: (sectionId: string) => void;
  toggleChecklist: (sectionId: string, itemIndex: number) => void;
  saveUserCode: (sectionId: string, language: "cpp" | "python", code: string) => void;
  saveQuizAnswer: (sectionId: string, questionId: string, answer: string) => void;
  resetQuizAnswers: (sectionId: string) => void;
  saveQuizScore: (sectionId: string, score: number) => void;
  saveNote: (sectionId: string, note: string) => void;
  updateSrsCard: (cardId: string, card: SrsCard) => void;
  recordWrongAnswers: (entries: WrongAnswerEntry[]) => void;
  clearWrongAnswers: () => void;
  resetProgress: () => void;
  overwriteProgress: (newProgress: ProgressState) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

const storageKey = "physical-ai-study-progress-v1";

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress, isLoaded] = useIndexedDB<ProgressState>(storageKey, emptyProgress);

  const logStudy = useCallback((sectionId: string, durationMs = 0) => {
    const today = new Date().toISOString().slice(0, 10);
    setProgress((prev) => ({
      ...prev,
      studyLog: [...(prev.studyLog ?? []), { date: today, sectionId, durationMs }],
    }));
  }, [setProgress]);

  const toggleSection = useCallback((sectionId: string) => {
    setProgress((prev) => ({
      ...prev,
      completedSections: {
        ...prev.completedSections,
        [sectionId]: !prev.completedSections[sectionId],
      },
    }));
    logStudy(sectionId);
  }, [setProgress, logStudy]);

  const toggleChecklist = useCallback((sectionId: string, itemIndex: number) => {
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
  }, [setProgress]);

  const saveUserCode = useCallback((sectionId: string, language: "cpp" | "python", code: string) => {
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
  }, [setProgress]);

  const saveQuizAnswer = useCallback((sectionId: string, questionId: string, answer: string) => {
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
  }, [setProgress]);

  const resetQuizAnswers = useCallback((sectionId: string) => {
    setProgress((prev) => {
      const nextAnswers = { ...(prev.quizAnswers ?? {}) };
      delete nextAnswers[sectionId];
      return {
        ...prev,
        quizAnswers: nextAnswers,
      };
    });
  }, [setProgress]);

  const saveQuizScore = useCallback((sectionId: string, score: number) => {
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
  }, [setProgress, logStudy]);

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
          [...(prev.wrongAnswers ?? []), ...entries].map((e) => [e.questionId, e])
        ).values()
      ),
    }));
  }, [setProgress]);

  const clearWrongAnswers = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      wrongAnswers: [],
    }));
  }, [setProgress]);

  const resetProgress = useCallback(() => {
    const ok = window.confirm("저장된 진행도와 퀴즈 점수를 초기화할까요?");
    if (ok) {
      Object.keys(window.localStorage)
        .filter((key) => key.startsWith("physical-ai-js-lab:"))
        .forEach((key) => window.localStorage.removeItem(key));
      setProgress(emptyProgress);
    }
  }, [setProgress]);

  const overwriteProgress = useCallback((newProgress: ProgressState) => {
    setProgress(newProgress);
  }, [setProgress]);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        isLoaded,
        logStudy,
        toggleSection,
        toggleChecklist,
        saveUserCode,
        saveQuizAnswer,
        resetQuizAnswers,
        saveQuizScore,
        saveNote,
        updateSrsCard,
        recordWrongAnswers,
        clearWrongAnswers,
        resetProgress,
        overwriteProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}
