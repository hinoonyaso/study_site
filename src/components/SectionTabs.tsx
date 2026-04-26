import { Code2, Eye, FileText, GraduationCap } from "lucide-react";

export type ActiveTab = "theory" | "practice" | "quiz" | "visual";

type SectionTabsProps = {
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
};

const tabs: Array<{ id: ActiveTab; label: string; icon: typeof FileText }> = [
  { id: "theory", label: "이론", icon: FileText },
  { id: "practice", label: "코드 실습", icon: Code2 },
  { id: "quiz", label: "시험", icon: GraduationCap },
  { id: "visual", label: "시각화", icon: Eye },
];

export function SectionTabs({ activeTab, onChange }: SectionTabsProps) {
  return (
    <div className="tabs" role="tablist" aria-label="학습 탭">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? "tab is-active" : "tab"}
            key={tab.id}
            onClick={() => onChange(tab.id)}
            role="tab"
            type="button"
          >
            <Icon size={17} aria-hidden />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
