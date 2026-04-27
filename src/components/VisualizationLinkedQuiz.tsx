import { Eye, Link2 } from "lucide-react";
import type { Session, VisualizationSpec } from "../types";

export function VisualizationLinkedQuiz({
  visualizations,
  session,
}: {
  visualizations: VisualizationSpec[];
  session: Session;
}) {
  return (
    <section className="panel visual-panel">
      <div className="panel-heading">
        <Eye size={18} aria-hidden />
        <h2>시각화-시험 연결</h2>
      </div>
      <div className="cheat-grid">
        {visualizations.map((visualization) => {
          const linkedQuestions = session.quizzes.filter((quiz) =>
            visualization.interpretationQuestions.some((question) => quiz.question.includes(question.slice(0, 12))) ||
            quiz.type === "visualization_interpretation" ||
            quiz.conceptTag === visualization.conceptTag,
          );
          return (
            <div className="cheat-card" key={visualization.id}>
              <span>개념 태그 · {visualization.conceptTag}</span>
              <strong>{visualization.title}</strong>
              <code>{visualization.connectedEquation}</code>
              <small>
                <Link2 size={13} aria-hidden /> 코드랩: {visualization.connectedCodeLab}
              </small>
              <ul className="clean-list">
                {visualization.interpretationQuestions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
              <small>연결 퀴즈 {linkedQuestions.length}개</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}
