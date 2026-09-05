import React, { useState, useEffect } from 'react';
import { BuildToolType, SavedResource } from './types';
import { BuildHero } from './components/BuildHero';
import { BuildThreeWaysSection, BuildCreationMethod } from './components/BuildThreeWaysSection';
import { AllGeneratorsSection } from './components/AllGeneratorsSection';
import { BuildFaqSection } from './components/BuildFaqSection';
import { MyResources } from './components/MyResources';
import { CourseBuilder } from './components/generators/CourseBuilder';
import { ExamGenerator } from './components/generators/ExamGenerator';
import { WorksheetGenerator } from './components/generators/WorksheetGenerator';
import { MindMapGenerator } from './components/generators/MindMapGenerator';
import { LessonPlanGenerator } from './components/generators/LessonPlanGenerator';
import { PdfStudyPackGenerator } from './components/generators/PdfStudyPackGenerator';
import { PresentationGenerator } from './components/generators/PresentationGenerator';
import { LearningPathBuilder } from './components/generators/LearningPathBuilder';
import { getSavedResources } from './utils/storage';
import { FolderOpen } from 'lucide-react';

export interface BuildAppProps {
  initialResource?: SavedResource | null;
  onGoHome?: () => void;
}

export default function BuildApp({ initialResource, onGoHome }: BuildAppProps) {
  const [activeTool, setActiveTool] = useState<BuildToolType | 'my-resources' | null>(null);
  const [activeResource, setActiveResource] = useState<SavedResource | any | null>(initialResource || null);
  const [activeMethod, setActiveMethod] = useState<BuildCreationMethod>('topic');
  const [savedCount, setSavedCount] = useState<number>(() => getSavedResources().length);

  useEffect(() => {
    if (initialResource) {
      setActiveResource(initialResource);
      const tool = initialResource.toolType as BuildToolType;
      setActiveTool(tool);
    }
  }, [initialResource]);

  const handleToolSelect = (toolId: BuildToolType) => {
    setActiveResource(null);
    setActiveTool(toolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSavedResource = (res: SavedResource) => {
    setActiveResource(res);
    setActiveTool(res.toolType as BuildToolType);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToWorkspace = () => {
    setActiveTool(null);
    setActiveResource(null);
    setSavedCount(getSavedResources().length);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSample = (sampleTopic: string, category: string, suggestedTool: BuildToolType = 'exam') => {
    setActiveResource({
      id: 'sample-' + Date.now(),
      toolType: suggestedTool,
      title: sampleTopic,
      topic: sampleTopic,
      subject: category,
      createdAt: new Date().toISOString(),
      data: null,
    });
    setActiveTool(suggestedTool);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF7F0] text-[#161616]">
      {/* 1. Generator Views */}
      {activeTool === 'course-builder' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CourseBuilder
            onBack={handleBackToWorkspace}
            onGoHome={onGoHome || handleBackToWorkspace}
            existingResource={activeResource?.data || activeResource}
            onSaved={() => setSavedCount(getSavedResources().length)}
          />
        </div>
      )}

      {activeTool === 'course' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CourseBuilder
            onBack={handleBackToWorkspace}
            onGoHome={onGoHome || handleBackToWorkspace}
            existingResource={activeResource?.data || activeResource}
            onSaved={() => setSavedCount(getSavedResources().length)}
          />
        </div>
      )}

      {activeTool === 'exam' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ExamGenerator
            onBack={handleBackToWorkspace}
            onGoHome={onGoHome || handleBackToWorkspace}
            initialResource={activeResource}
          />
        </div>
      )}

      {activeTool === 'worksheet' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <WorksheetGenerator
            onBack={handleBackToWorkspace}
            onGoHome={onGoHome || handleBackToWorkspace}
            initialResource={activeResource}
          />
        </div>
      )}

      {activeTool === 'mind-map' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MindMapGenerator
            onBack={handleBackToWorkspace}
            onGoHome={onGoHome || handleBackToWorkspace}
            existingResource={activeResource?.data || activeResource}
            onSaved={() => setSavedCount(getSavedResources().length)}
          />
        </div>
      )}

      {activeTool === 'lesson-plan' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LessonPlanGenerator
            onBack={handleBackToWorkspace}
            onGoHome={onGoHome || handleBackToWorkspace}
            initialResource={activeResource}
          />
        </div>
      )}

      {activeTool === 'pdf-studypack' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PdfStudyPackGenerator
            onBack={handleBackToWorkspace}
            onGoHome={onGoHome || handleBackToWorkspace}
            initialResource={activeResource}
          />
        </div>
      )}

      {activeTool === 'presentation' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PresentationGenerator
            onBack={handleBackToWorkspace}
            onGoHome={onGoHome || handleBackToWorkspace}
            existingResource={activeResource?.data || activeResource}
            onSaved={() => setSavedCount(getSavedResources().length)}
          />
        </div>
      )}

      {activeTool === 'learning-path' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LearningPathBuilder
            onBack={handleBackToWorkspace}
            onGoHome={onGoHome || handleBackToWorkspace}
            existingResource={activeResource?.data || activeResource}
            onSaved={() => setSavedCount(getSavedResources().length)}
          />
        </div>
      )}

      {activeTool === 'my-resources' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MyResources
            onBack={handleBackToWorkspace}
            onGoHome={onGoHome || handleBackToWorkspace}
            onOpenResource={handleOpenSavedResource}
          />
        </div>
      )}

      {/* 2. Main Workspace Dashboard */}
      {activeTool === null && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {/* Top Quick Action Bar */}
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E63956]"></span>
              <span className="font-mono text-base font-bold text-stone-700 uppercase tracking-wider">
                CURRICULUM & RESOURCE BUILDER
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveTool('my-resources')}
              className="px-4 py-2.5 rounded-xl bg-white border border-stone-200/90 hover:border-[#E63956] hover:bg-pink-50/50 text-stone-900 font-mono text-base font-bold uppercase flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <FolderOpen className="w-4 h-4 text-[#E63956]" />
              <span>My Saved Resources ({savedCount})</span>
            </button>
          </div>

          {/* Hero Section */}
          <BuildHero
            onStartClick={() => {
              const el = document.getElementById('all-generators-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onSelectSample={handleSelectSample}
            onUploadPdfClick={() => handleToolSelect('pdf-studypack')}
          />

          {/* 3 Ways to Build Section */}
          <BuildThreeWaysSection
            activeMethod={activeMethod}
            onSelectMethod={(method) => {
              setActiveMethod(method);
              if (method === 'pdf') {
                handleToolSelect('pdf-studypack');
              } else {
                const el = document.getElementById('all-generators-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />

          {/* All Generators Grid */}
          <AllGeneratorsSection onSelectTool={handleToolSelect} />

          {/* FAQ Section */}
          <BuildFaqSection />
        </div>
      )}
    </div>
  );
}
