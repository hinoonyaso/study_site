import { useEffect } from "react";
import type { ActiveTab } from "../components/SectionTabs";

type ShortcutHandlers = {
  setTab: (tab: ActiveTab) => void;
  nextSection: () => void;
  prevSection: () => void;
  executeAction?: () => void;
};

const TAB_MAP: Record<string, ActiveTab> = {
  "1": "theory",
  "2": "practice",
  "3": "quiz",
  "4": "visual",
};

export function useKeyboardShortcuts({ setTab, nextSection, prevSection, executeAction }: ShortcutHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea/contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        // Still handle Ctrl+Enter in code areas
        if (e.ctrlKey && e.key === "Enter" && executeAction) {
          e.preventDefault();
          executeAction();
        }
        return;
      }

      // Tab switching: 1-4
      if (TAB_MAP[e.key] && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setTab(TAB_MAP[e.key]);
        return;
      }

      // Navigation: j/k
      if (e.key === "j" && !e.ctrlKey) {
        e.preventDefault();
        nextSection();
        return;
      }
      if (e.key === "k" && !e.ctrlKey) {
        e.preventDefault();
        prevSection();
        return;
      }

      // Ctrl+Enter: execute
      if (e.ctrlKey && e.key === "Enter" && executeAction) {
        e.preventDefault();
        executeAction();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [setTab, nextSection, prevSection, executeAction]);
}
