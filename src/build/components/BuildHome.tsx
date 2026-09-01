import React from 'react';
import { BuildHero } from './BuildHero';
import { BuildThreeWaysSection, BuildCreationMethod } from './BuildThreeWaysSection';
import { AllGeneratorsSection } from './AllGeneratorsSection';
import { BuildFaqSection } from './BuildFaqSection';
import { BuildToolType } from '../types';
import { Bookmark } from 'lucide-react';

interface BuildHomeProps {
  onSelectTool: (toolId: BuildToolType, prefillTopic?: string, prefillCategory?: string) => void;
  onOpenMyResources: () => void;
  savedCount: number;
}

export const BuildHome: React.FC<BuildHomeProps> = ({
  onSelectTool,
  onOpenMyResources,
  savedCount,
}) => {
  const [activeMethod, setActiveMethod] = React.useState<BuildCreationMethod>('topic');

  const handleStartClick = () => {
    const el = document.getElementById('all-generators-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectSample = (topic: string, category: string, suggestedTool?: BuildToolType) => {
    const tool = suggestedTool || 'exam';
    onSelectTool(tool, topic, category);
  };

  const handleUploadPdfClick = () => {
    setActiveMethod('pdf');
    onSelectTool('pdf-studypack');
  };

  const handleSelectMethod = (method: BuildCreationMethod) => {
    setActiveMethod(method);
    if (method === 'pdf') {
      onSelectTool('pdf-studypack');
    } else {
      const el = document.getElementById('all-generators-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 sm:space-y-14">
      {/* Top Floating My Resources Quick Bar */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onOpenMyResources}
          className="px-5 py-2.5 rounded-full bg-[#161616] hover:bg-stone-800 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer active:scale-95"
        >
          <Bookmark className="w-4 h-4 text-[#E63956]" />
          <span>My Saved Builds</span>
          {savedCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#E63956] text-white text-[11px] font-mono">
              {savedCount}
            </span>
          )}
        </button>
      </div>

      {/* 1. Build Header Section with Instant Inspiration */}
      <BuildHero
        onStartClick={handleStartClick}
        onSelectSample={handleSelectSample}
        onUploadPdfClick={handleUploadPdfClick}
      />

      {/* 2. 3 Ways to Create Section */}
      <BuildThreeWaysSection
        activeMethod={activeMethod}
        onSelectMethod={handleSelectMethod}
      />

      {/* 3. All 8 Generators Section */}
      <AllGeneratorsSection
        onSelectTool={(toolId) => onSelectTool(toolId)}
      />

      {/* 4. Frequently Asked Questions Section */}
      <BuildFaqSection />
    </div>
  );
};

