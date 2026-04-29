import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronRight, Info } from 'lucide-react';
import type { VisualizationSpec } from '../../types';
import { Slider } from './VisualizerUtils';

export function VisualizationSpecInteractiveCard({ spec }: { spec: VisualizationSpec }) {
  const initialValues = useMemo(
    () => Object.fromEntries((spec.parameters ?? []).map((parameter) => [parameter.name, parameter.default])),
    [spec],
  );
  const [values, setValues] = useState<Record<string, number>>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const parameterSummary = (spec.parameters ?? [])
    .map((parameter) => `${parameter.symbol}=${Number(values[parameter.name] ?? parameter.default).toFixed(2)}`)
    .join(' · ');

  return (
    <div className="cheat-card" style={{ border: '1px solid var(--line)', padding: '12px', borderRadius: '8px', background: 'var(--surface)' }}>
      <div className="cheat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <strong style={{ color: 'var(--primary)', fontSize: '0.95em' }}>{spec.title}</strong>
        <span className="badge" style={{ fontSize: '0.7em', padding: '2px 6px', background: 'var(--line)', borderRadius: '4px' }}>{spec.conceptTag}</span>
      </div>
      <div className="cheat-content" style={{ fontSize: '0.85em', color: 'var(--foreground)' }}>
        <p style={{ margin: '4px 0' }}>{spec.normalCase}</p>
        {spec.parameters && spec.parameters.length > 0 && (
          <div style={{ marginTop: '8px', opacity: 0.8 }}>
            <small>{parameterSummary}</small>
            <div style={{ display: 'grid', gap: '8px', marginTop: '8px' }}>
              {spec.parameters.map((parameter) => (
                <Slider
                  key={parameter.name}
                  label={parameter.symbol}
                  max={parameter.max}
                  min={parameter.min}
                  onChange={(value) => setValues((current) => ({ ...current, [parameter.name]: value }))}
                  step={(parameter.max - parameter.min) / 100}
                  value={values[parameter.name] ?? parameter.default}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
