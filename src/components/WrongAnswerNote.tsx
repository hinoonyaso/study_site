import { WrongAnswerAnalyzer } from "./WrongAnswerAnalyzer";
import type { CurriculumModule, WrongAnswerEntry } from "../types";

type WrongAnswerNoteProps = {
  modules: CurriculumModule[];
  onOpenReviewTarget?: (target: string) => void;
  wrongAnswers: WrongAnswerEntry[];
};

export function WrongAnswerNote({ modules, onOpenReviewTarget, wrongAnswers }: WrongAnswerNoteProps) {
  return <WrongAnswerAnalyzer modules={modules} onOpenReviewTarget={onOpenReviewTarget} wrongAnswers={wrongAnswers} />;
}
