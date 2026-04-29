import { Code2, Eye, FileText, GraduationCap } from "lucide-react";

export type ActiveTab = "theory" | "practice" | "quiz" | "visual" | "flashcard" | "notes" | "progress" | "assessment" | "sources";

type SectionTabsProps = {
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
};

const mainTabs: Array<{ id: ActiveTab; label: string; icon: typeof FileText }> = [
  { id: "theory", label: "이론", icon: FileText },
  { id: "quiz", label: "시험", icon: GraduationCap },
  { id: "practice", label: "코드 실습", icon: Code2 },
  { id: "visual", label: "시각화", icon: Eye },
];

export function SectionTabs({ activeTab, onChange }: SectionTabsProps) {
  const handleTabClick = (id: ActiveTab) => {
    onChange(id);
  };

  return (
    <div className="tabs" role="tablist" aria-label="학습 탭">
      {mainTabs.map((tab) => {
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
    </div>
  );
}
