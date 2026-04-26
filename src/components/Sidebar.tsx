import { useState } from "react";
import { BookOpen, CheckCircle2, Circle, Menu } from "lucide-react";
import { SearchBar } from "./SearchBar";
import type { CurriculumModule, ProgressState } from "../types";

type SidebarProps = {
  modules: CurriculumModule[];
  selectedModuleId: string;
  selectedSectionId: string;
  onSelectModule: (id: string) => void;
  onSelectSection: (moduleId: string, sectionId: string) => void;
  progress: ProgressState;
};

export function Sidebar({ modules, selectedModuleId, selectedSectionId, onSelectModule, onSelectSection, progress }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState("전체");
  const selectSection = (moduleId: string, sectionId: string) => {
    onSelectSection(moduleId, sectionId);
    setIsOpen(false);
  };

  const stageFilters = ["전체", "기초수학", "로봇수학", "ROS 2", "로봇팔", "자율주행", "AI/센서", "시스템/평가"];
  const sectionMatchesStage = (module: CurriculumModule, section: CurriculumModule["sections"][number]) => {
    const haystack = `${module.id} ${module.title} ${section.id} ${section.title} ${section.focus} ${
      section.groupTitle ?? ""
    } ${(section.sourceIds ?? []).join(" ")} ${(section.scenarioTags ?? []).join(" ")}`.toLowerCase();
    if (stageFilter === "전체") return true;
    if (stageFilter === "기초수학") return haystack.includes("math") || haystack.includes("수학") || haystack.includes("algebra");
    if (stageFilter === "로봇수학") return /jacobian|transform|kinematics|dynamics|optimization|확률|제어/.test(haystack);
    if (stageFilter === "ROS 2") return /ros2|tf2|qos|launch|executor|callback|rosbag/.test(haystack);
    if (stageFilter === "로봇팔") return /manipulator|moveit|robot arm|로봇팔/.test(haystack);
    if (stageFilter === "자율주행") return /mobile|nav2|slam|planner|costmap|pure|stanley|자율주행/.test(haystack);
    if (stageFilter === "AI/센서") return /ai|opencv|onnx|pcl|camera|vision|sensor|센서/.test(haystack);
    return /realtime|safety|eval|logging|latency|routine|checklist|평가|실시간|안전/.test(haystack);
  };

  return (
    <aside className="sidebar" aria-label="커리큘럼 모듈">
      <div className="brand">
        <BookOpen size={22} aria-hidden />
        <div>
          <strong>Physical AI Lab</strong>
          <span>ROS 2 Humble 학습 사이트</span>
        </div>
        <button
          aria-expanded={isOpen}
          aria-label="목차 열기"
          className="mobile-sidebar-toggle"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          <Menu size={18} aria-hidden />
        </button>
      </div>

      <div className={`sidebar-content ${isOpen ? "is-open" : ""}`}>
        <SearchBar modules={modules} onSelect={selectSection} />
        <div className="stage-filter" aria-label="학습 단계 필터">
          {stageFilters.map((filter) => (
            <button
              className={stageFilter === filter ? "is-active" : ""}
              key={filter}
              onClick={() => setStageFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>

        <nav className="module-list">
        {modules.map((module) => {
          const visibleSections = module.sections.filter((section) => sectionMatchesStage(module, section));
          if (visibleSections.length === 0) return null;
          const total = visibleSections.length;
          const done = visibleSections.filter((section) => progress.completedSections[section.id]).length;
          const isSelected = module.id === selectedModuleId;
          return (
            <div className="module-group" key={module.id}>
              <button
                className={`module-button ${isSelected ? "is-selected" : ""}`}
                onClick={() => {
                  if (visibleSections[0]) selectSection(module.id, visibleSections[0].id);
                  else onSelectModule(module.id);
                }}
                type="button"
              >
                {done === total ? <CheckCircle2 size={17} aria-hidden /> : <Circle size={17} aria-hidden />}
                <span>
                  <strong>{module.title}</strong>
                  <small>
                    {done}/{total} 세션 완료
                  </small>
                </span>
              </button>
              {isSelected && (
                <div className="micro-section-list">
                  {visibleSections.map((section) => (
                    <button
                      className={`micro-section-button ${section.id === selectedSectionId ? "is-selected" : ""}`}
                      key={section.id}
                      onClick={() => selectSection(module.id, section.id)}
                      type="button"
                    >
                      <span>{section.groupTitle ?? module.title}</span>
                      <strong>{section.title}</strong>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        </nav>
      </div>
    </aside>
  );
}
