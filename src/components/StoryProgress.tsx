import React from 'react';

interface StoryProgressProps {
  sections: { id: string; label: string }[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const StoryProgress: React.FC<StoryProgressProps> = ({
  sections,
  activeSection,
  onNavigate,
}) => {
  return (
    <div
      id="story-progress-indicator"
      className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-3 pointer-events-auto select-none"
    >
      {sections.map((section, idx) => {
        const isActive = activeSection === section.id;
        return (
          <button
            key={section.id}
            id={`story-dot-${section.id}`}
            onClick={() => onNavigate(section.id)}
            className="group flex items-center gap-2 cursor-pointer focus:outline-none"
            aria-label={`Jump to ${section.label}`}
          >
            {/* Hover Tooltip Label */}
            <span
              className={`text-[10px] font-mono tracking-widest uppercase transition-all duration-200 px-2.5 py-0.5 rounded-lg glass-panel bg-[#151326]/95 border border-white/10 ${
                isActive
                  ? 'opacity-100 text-[#FF5C4D] translate-x-0 font-semibold'
                  : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-[#8A8579]'
              }`}
            >
              0{idx + 1} {section.label}
            </span>

            {/* Indicator Dot / Capsule */}
            <div
              className={`transition-all duration-300 rounded-full relative overflow-hidden ${
                isActive
                  ? 'w-2.5 h-7 bg-[#FF5C4D] shadow-lg shadow-[#FF5C4D]/50'
                  : 'w-2 h-2 bg-white/20 group-hover:bg-[#FF5C4D] group-hover:scale-125'
              }`}
            >
              {/* Traveling shimmer beam when on Hero section to show scrollability */}
              {isActive && section.id === 'hero' && (
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                  <div className="w-full h-1/2 bg-white/70 rounded-full animate-scroll-pill" />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
