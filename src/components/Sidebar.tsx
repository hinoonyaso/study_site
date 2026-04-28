import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, ChevronDown, ChevronRight, Circle, Compass, Eye, EyeOff, Menu } from "lucide-react";
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
  const [hideCompleted, setHideCompleted] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set([selectedModuleId]));

  useEffect(() => {
    setExpandedModules((prev) => {
      if (prev.has(selectedModuleId)) return prev;
      return new Set([...prev, selectedModuleId]);
    });
  }, [selectedModuleId]);

  const selectSection = (moduleId: string, sectionId: string) => {
    onSelectSection(moduleId, sectionId);
    setIsOpen(false);
  };

  const toggleModule = (moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectModule(moduleId);
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const stageFilters = ["전체", "기초수학", "로봇수학", "ROS 2", "로봇팔", "자율주행", "AI/센서", "시스템/평가"];
  const sectionMatchesStage = (
    module: CurriculumModule,
    section: CurriculumModule["sections"][number],
    filter = stageFilter,
  ) => {
    const haystack = `${module.id} ${module.title} ${section.id} ${section.title} ${section.focus} ${
      section.groupTitle ?? ""
    } ${(section.sourceIds ?? []).join(" ")} ${(section.scenarioTags ?? []).join(" ")}`.toLowerCase();
    if (filter === "전체") return true;
    if (filter === "기초수학") return haystack.includes("math") || haystack.includes("수학") || haystack.includes("algebra");
    if (filter === "로봇수학") return /jacobian|transform|kinematics|dynamics|optimization|확률|제어/.test(haystack);
    if (filter === "ROS 2") return /ros2|tf2|qos|launch|executor|callback|rosbag/.test(haystack);
    if (filter === "로봇팔") return /manipulator|moveit|robot arm|로봇팔/.test(haystack);
    if (filter === "자율주행") return /mobile|nav2|slam|planner|costmap|pure|stanley|자율주행/.test(haystack);
    if (filter === "AI/센서") return /ai|opencv|onnx|pcl|camera|vision|sensor|센서/.test(haystack);
    return /realtime|safety|eval|logging|latency|routine|checklist|평가|실시간|안전/.test(haystack);
  };
  const stageFilterCounts = stageFilters.map((filter) => ({
    filter,
    count: modules.reduce(
      (sum, module) => sum + module.sections.filter((section) => sectionMatchesStage(module, section, filter)).length,
      0,
    ),
  }));

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
        <div className="stage-filter-panel">
          <div className="stage-filter-heading">
            <Compass size={17} aria-hidden />
            <div>
              <strong>학습 목적</strong>
              <span>원하는 길만 먼저 볼 수 있습니다</span>
            </div>
          </div>
          <div className="stage-filter" aria-label="학습 단계 필터">
            {stageFilterCounts.map(({ filter, count }) => (
              <button
                className={stageFilter === filter ? "is-active" : ""}
                key={filter}
                onClick={() => setStageFilter(filter)}
                type="button"
              >
                <span>{filter}</span>
                <small>({count}개)</small>
              </button>
            ))}
          </div>
          <button 
            className={`hide-completed-toggle ${hideCompleted ? "is-active" : ""}`} 
            onClick={() => setHideCompleted(!hideCompleted)}
            type="button"
          >
            {hideCompleted ? <EyeOff size={15} aria-hidden /> : <Eye size={15} aria-hidden />}
            완성된 세션 숨기기
          </button>
        </div>

        <nav className="module-list">
        {modules.map((module) => {
          let visibleSections = module.sections.filter((section) => sectionMatchesStage(module, section));
          const total = visibleSections.length;
          const done = visibleSections.filter((section) => progress.completedSections[section.id]).length;
          
          if (hideCompleted) {
            visibleSections = visibleSections.filter((section) => !progress.completedSections[section.id]);
          }
          if (visibleSections.length === 0 && total > 0 && hideCompleted) {
            // If all sections are completed and we're hiding them, we still render the module header (collapsed)
            // Or maybe just skip? Let's render the module header but no sections inside.
          } else if (visibleSections.length === 0) return null;

          const isSelected = module.id === selectedModuleId;
          const isExpanded = expandedModules.has(module.id);
          return (
            <div className="module-group" key={module.id}>
              <button
                className={`module-button ${isSelected ? "is-selected" : ""}`}
                onClick={(e) => toggleModule(module.id, e)}
                type="button"
              >
                <span className="module-button-icon">
                  {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </span>
                <span>
                  <strong>{module.title}</strong>
                  <small>
                    {done}/{total} 세션 완료
                  </small>
                </span>
              </button>
              {isExpanded && (
                <div className="micro-section-list">
                  {visibleSections.length === 0 ? (
                    <div className="all-completed-message">모든 세션을 완료했습니다 🎉</div>
                  ) : (
                    visibleSections.map((section) => (
                      <button
                        className={`micro-section-button ${section.id === selectedSectionId ? "is-selected" : ""} ${progress.completedSections[section.id] ? "is-done" : ""}`}
                        key={section.id}
                        onClick={() => selectSection(module.id, section.id)}
                        type="button"
                      >
                        <span className="micro-section-title">
                          {progress.completedSections[section.id] && <CheckCircle2 size={13} aria-hidden />}
                          {section.groupTitle ?? module.title}
                        </span>
                        <strong>{section.title}</strong>
                      </button>
                    ))
                  )}
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
