import { useCallback, useEffect, useRef, useState } from "react";
import { FileText } from "lucide-react";

type NotesEditorProps = {
  sectionId: string;
  value: string;
  onSave: (sectionId: string, note: string) => void;
};

export function NotesEditor({ sectionId, value, onSave }: NotesEditorProps) {
  const [text, setText] = useState(value);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setText(value);
  }, [sectionId, value]);

  const debouncedSave = useCallback(
    (newText: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSave(sectionId, newText);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }, 600);
    },
    [sectionId, onSave],
  );

  const handleChange = (newText: string) => {
    setText(newText);
    debouncedSave(newText);
  };

  return (
    <section className="panel notes-panel">
      <div className="panel-heading">
        <FileText size={18} aria-hidden />
        <h2>메모</h2>
        {saved && <span className="notes-saved">✓ 저장됨</span>}
      </div>
      <textarea
        className="notes-textarea"
        onChange={(e) => handleChange(e.target.value)}
        placeholder="이 섹션에 대한 메모를 자유롭게 작성하세요…"
        rows={5}
        value={text}
      />
    </section>
  );
}
