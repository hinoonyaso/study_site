import { WrongAnswerAnalyzer } from "./WrongAnswerAnalyzer";
import type { CurriculumModule, WrongAnswerEntry } from "../types";

type WrongAnswerNoteProps = {
  modules: CurriculumModule[];
  wrongAnswers: WrongAnswerEntry[];
};

export function WrongAnswerNote({ modules, wrongAnswers }: WrongAnswerNoteProps) {
  return <WrongAnswerAnalyzer modules={modules} wrongAnswers={wrongAnswers} />;
}
