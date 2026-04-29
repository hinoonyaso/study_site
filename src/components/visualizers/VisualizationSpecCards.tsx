import { CheckCircle2, ChevronRight, Info, Workflow } from 'lucide-react';
import type { LessonSection } from '../../types';
import { VisualizationSpecInteractiveCard } from './VisualizationSpecInteractiveCard';

export function VisualizationSpecCards({ section }: { section: LessonSection }) {
  const specs = section.v2Session?.visualizations ?? [];
  if (specs.length === 0) return null;
  return (
    <section className="panel visual-panel">
      <div className="panel-heading">
        <Workflow size={18} aria-hidden />
        <h2>시각화 연결 정보</h2>
      </div>
      <div className="cheat-grid">
        {specs.map((spec) => <VisualizationSpecInteractiveCard key={spec.id} spec={spec} />)}
      </div>
    </section>
  );
}
