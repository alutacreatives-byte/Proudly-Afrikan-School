import React, { useState } from 'react';
import { StudyHero } from './StudyHero';
import { StudyThreeWaysSection, StudyCreationMethod } from './StudyThreeWaysSection';
import { StudyGeneratorsSection } from './StudyGeneratorsSection';
import { StudyFaqSection } from './StudyFaqSection';
import { StudyToolType } from '../types';

interface StudyHomeProps {
  onSelectTool: (toolId: StudyToolType, prefillTopic?: string, prefillCategory?: string) => void;
  onOpenMyResources?: () => void;
  savedCount?: number;
}

export const StudyHome: React.FC<StudyHomeProps> = ({
  onSelectTool,
  onOpenMyResources,
  savedCount = 0,
}) => {
  const [activeMethod, setActiveMethod] = useState<StudyCreationMethod>('topic');

  const handleStartClick = () => {
    const el = document.getElementById('study-generators-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectSample = (topic: string, category: string, suggestedTool?: StudyToolType) => {
    const tool = suggestedTool || 'study-guide';
    onSelectTool(tool, topic, category);
  };

  const handleUploadPdfClick = () => {
    setActiveMethod('pdf');
    onSelectTool('pdf-quiz');
  };

  const handleSelectMethod = (method: StudyCreationMethod) => {
    setActiveMethod(method);
    if (method === 'pdf') {
      onSelectTool('pdf-quiz');
    } else {
      const el = document.getElementById('study-generators-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 sm:space-y-14">
      {/* 1. Study Header Section with Instant Inspiration */}
      <StudyHero
        onStartClick={handleStartClick}
        onSelectSample={handleSelectSample}
        onUploadPdfClick={handleUploadPdfClick}
      />

      {/* 2. 3 Ways to Study Section */}
      <StudyThreeWaysSection
        activeMethod={activeMethod}
        onSelectMethod={handleSelectMethod}
      />

      {/* 3. All 7 Study Tools Section */}
      <StudyGeneratorsSection
        onSelectTool={(toolId) => onSelectTool(toolId)}
      />

      {/* 4. Frequently Asked Questions Section */}
      <StudyFaqSection />
    </div>
  );
};
