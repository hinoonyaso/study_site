import { useEffect, useState } from "react";
import { Code2, Eye, FileText, GraduationCap } from "lucide-react";

export type ActiveTab = "theory" | "practice" | "quiz" | "visual";

type SectionTabsProps = {
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
};

const tabs: Array<{ id: ActiveTab; label: string; icon: typeof FileText }> = [
  { id: "theory", label: "① 이론", icon: FileText },
  { id: "quiz", label: "② 시험", icon: GraduationCap },
  { id: "practice", label: "③ 코드 실습", icon: Code2 },
  { id: "visual", label: "④ 시각화", icon: Eye },
];

export function SectionTabs({ activeTab, onChange }: SectionTabsProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem("physical-ai-tab-tooltip-seen") !== "1") {
      setShowTooltip(true);
    }
  }, []);

  const handleTabClick = (id: ActiveTab) => {
    if (showTooltip) {
      setShowTooltip(false);
      window.localStorage.setItem("physical-ai-tab-tooltip-seen", "1");
    }
    onChange(id);
  };

  return (
    <div className="tabs" role="tablist" aria-label="학습 탭" style={{ position: "relative" }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? "tab is-active" : "tab"}
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            role="tab"
            type="button"
          >
            <Icon size={17} aria-hidden />
            {tab.label}
          </button>
        );
      })}
      {showTooltip && (
        <div className="tab-order-tooltip" style={{
          position: "absolute",
          top: "-35px",
          left: "20px",
          background: "var(--primary, #3b82f6)",
          color: "white",
          padding: "6px 12px",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: "bold",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          animation: "bounce 2s infinite",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          zIndex: 10
        }}>
          ① 이론 → ② 시험 → ③ 코드 실습 → ④ 시각화 순서로 학습하세요
          <div style={{
            content: '""',
            position: "absolute",
            bottom: "-5px",
            left: "20px",
            borderWidth: "5px 5px 0",
            borderStyle: "solid",
            borderColor: "var(--primary, #3b82f6) transparent transparent transparent",
            display: "block",
            width: 0,
          }}></div>
        </div>
      )}
    </div>
  );
}
