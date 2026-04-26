import { useMemo, useState } from "react";
import { Brain, RotateCcw } from "lucide-react";
import { BlockMath, MathText } from "./KatexRenderer";
import type { CurriculumModule, ProgressState, SrsCard } from "../types";

type FlashcardPanelProps = {
  modules: CurriculumModule[];
  progress: ProgressState;
  onUpdateCard: (cardId: string, card: SrsCard) => void;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function sm2Update(card: SrsCard, quality: number): SrsCard {
  // quality: 0=어려움, 1=보통, 2=쉬움
  const q = quality * 2 + 1; // map to 1,3,5
  let { ease, interval, repetitions } = card;

  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 3;
    else interval = Math.round(interval * ease);
    repetitions++;
  }

  ease = Math.max(1.3, ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    ease: Math.round(ease * 100) / 100,
    interval,
    nextReview: nextDate.toISOString().slice(0, 10),
    repetitions,
  };
}

type CardData = {
  id: string;
  front: string;
  back: string;
  sectionTitle: string;
  hasFormula: boolean;
};

export function FlashcardPanel({ modules, progress, onUpdateCard }: FlashcardPanelProps) {
  const [showBack, setShowBack] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const allCards = useMemo<CardData[]>(() => {
    const cards: CardData[] = [];
    for (const module of modules) {
      for (const section of module.sections) {
        for (const q of section.quiz) {
          cards.push({
            id: `${section.id}::${q.id}`,
            front: q.prompt,
            back: q.answer + (q.explanation ? `\n\n${q.explanation}` : ""),
            sectionTitle: section.title,
            hasFormula: /[=+*/^]/.test(q.answer) || /cos|sin|sqrt/.test(q.answer),
          });
        }
        // Add formulas as cards
        for (const theory of section.theory) {
          for (const f of theory.formulas) {
            cards.push({
              id: `${section.id}::formula::${f.label}`,
              front: `${f.label}의 공식을 쓰시오.\n\n힌트: ${f.description}`,
              back: f.expression,
              sectionTitle: section.title,
            hasFormula: true,
          });
        }
        for (const card of section.v2Session?.flashcards ?? []) {
          cards.push({
            id: `${section.id}::session-card::${card.id}`,
            front: card.front,
            back: card.back,
            sectionTitle: section.title,
            hasFormula: /[=+*/^]/.test(card.back) || /cos|sin|sqrt|theta|lambda/.test(card.back),
          });
        }
      }
    }
    }
    return cards;
  }, [modules]);

  const dueCards = useMemo(() => {
    const today = todayISO();
    return allCards.filter((card) => {
      const srs = progress.srsCards[card.id];
      if (!srs) return true; // new card
      return srs.nextReview <= today;
    });
  }, [allCards, progress.srsCards]);

  const current = dueCards[currentIndex];

  const handleRate = (quality: number) => {
    if (!current) return;
    const existing = progress.srsCards[current.id] ?? {
      ease: 2.5,
      interval: 0,
      nextReview: todayISO(),
      repetitions: 0,
    };
    const updated = sm2Update(existing, quality);
    onUpdateCard(current.id, updated);
    setShowBack(false);
    setCurrentIndex((i) => Math.min(i + 1, dueCards.length - 1));
  };

  if (dueCards.length === 0) {
    return (
      <section className="panel flashcard-panel">
        <div className="panel-heading">
          <Brain size={18} aria-hidden />
          <h2>복습 카드</h2>
        </div>
        <div className="flashcard-empty">
          <p>오늘 복습할 카드가 없습니다.</p>
          <small>퀴즈를 풀면 자동으로 복습 카드가 생성됩니다.</small>
        </div>
      </section>
    );
  }

  return (
    <section className="panel flashcard-panel">
      <div className="panel-heading">
        <Brain size={18} aria-hidden />
        <h2>복습 카드</h2>
        <span className="flashcard-count">
          {currentIndex + 1}/{dueCards.length}
        </span>
      </div>

      <div className="flashcard">
        <div className="flashcard-section">{current.sectionTitle}</div>
        <div className="flashcard-front">
          <p><MathText text={current.front} /></p>
        </div>

        {showBack ? (
          <>
            <div className="flashcard-back">
              {current.hasFormula ? (
                <BlockMath expression={current.back.split("\n")[0]} />
              ) : (
                <p><MathText text={current.back} /></p>
              )}
              {current.hasFormula && current.back.split("\n").slice(1).join("\n").trim() && (
                <p><MathText text={current.back.split("\n").slice(1).join("\n")} /></p>
              )}
            </div>
            <div className="flashcard-actions">
              <button className="flash-btn flash-hard" onClick={() => handleRate(0)} type="button">
                어려움
              </button>
              <button className="flash-btn flash-ok" onClick={() => handleRate(1)} type="button">
                보통
              </button>
              <button className="flash-btn flash-easy" onClick={() => handleRate(2)} type="button">
                쉬움
              </button>
            </div>
          </>
        ) : (
          <button className="primary-button flashcard-reveal" onClick={() => setShowBack(true)} type="button">
            <RotateCcw size={16} aria-hidden />
            정답 보기
          </button>
        )}
      </div>
    </section>
  );
}
