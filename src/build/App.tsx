import React, { useState, useEffect } from 'react';
import { BuildToolType, SavedResource, ExamPaper, WorksheetResource, MindMapResource, StudyPackResource, LessonPlanResource, PresentationResource, CourseResource, LearningPathResource } from './types';
import { BuildHome } from './components/BuildHome';
import { ExamGenerator } from './components/generators/ExamGenerator';
import { WorksheetGenerator } from './components/generators/WorksheetGenerator';
import { MindMapGenerator } from './components/generators/MindMapGenerator';
import { PdfStudyPackGenerator } from './components/generators/PdfStudyPackGenerator';
import { LessonPlanGenerator } from './components/generators/LessonPlanGenerator';
import { PresentationGenerator } from './components/generators/PresentationGenerator';
import { CourseBuilder } from './components/generators/CourseBuilder';
import { LearningPathBuilder } from './components/generators/LearningPathBuilder';
import { MyResources } from './components/MyResources';
import { getSavedResources } from './utils/storage';

interface BuildAppProps {
  initialResource?: SavedResource | null;
  onGoHome?: () => void;
}

export const BuildApp: React.FC<BuildAppProps> = ({
  initialResource,
  onGoHome,
}) => {
  const [activeTool, setActiveTool] = useState<BuildToolType | 'my-resources' | null>(
    initialResource ? (initialResource.toolType as BuildToolType) : null
  );
  const [activeResource, setActiveResource] = useState<SavedResource | null>(initialResource || null);
  const [savedCount, setSavedCount] = useState<number>(getSavedResources().length);

  useEffect(() => {
    if (initialResource) {
      setActiveResource(initialResource);
      setActiveTool(initialResource.toolType as BuildToolType);
    }
  }, [initialResource]);

  const refreshSavedCount = () => {
    setSavedCount(getSavedResources().length);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTool]);

  const handleSelectTool = (toolId: BuildToolType, prefillTopic?: string, prefillCategory?: string) => {
    if (prefillTopic) {
      setActiveResource({
        id: `temp-${Date.now()}`,
        title: prefillTopic,
        topic: prefillTopic,
        subject: prefillCategory,
        createdAt: new Date().toISOString(),
        toolType: toolId,
      } as any);
    } else {
      setActiveResource(null);
    }
    setActiveTool(toolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSavedResource = (resource: SavedResource) => {
    setActiveResource(resource);
    setActiveTool(resource.toolType);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToGrid = () => {
    setActiveTool(null);
    setActiveResource(null);
    refreshSavedCount();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render sub-view
  if (activeTool === 'my-resources') {
    return (
      <MyResources
        onBack={handleBackToGrid}
        onGoHome={onGoHome || handleBackToGrid}
        onOpenResource={handleOpenSavedResource}
      />
    );
  }

  if (activeTool === 'exam') {
    return (
      <ExamGenerator
        onBack={handleBackToGrid}
        onGoHome={onGoHome || handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource?.toolType === 'exam' ? (activeResource as ExamPaper) : undefined}
      />
    );
  }

  if (activeTool === 'worksheet') {
    return (
      <WorksheetGenerator
        onBack={handleBackToGrid}
        onGoHome={onGoHome || handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource?.toolType === 'worksheet' ? (activeResource as WorksheetResource) : undefined}
      />
    );
  }

  if (activeTool === 'mind-map') {
    return (
      <MindMapGenerator
        onBack={handleBackToGrid}
        onGoHome={onGoHome || handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource?.toolType === 'mind-map' ? (activeResource as MindMapResource) : undefined}
      />
    );
  }

  if (activeTool === 'pdf-studypack') {
    return (
      <PdfStudyPackGenerator
        onBack={handleBackToGrid}
        onGoHome={onGoHome || handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource?.toolType === 'pdf-studypack' ? (activeResource as StudyPackResource) : undefined}
      />
    );
  }

  if (activeTool === 'lesson-plan') {
    return (
      <LessonPlanGenerator
        onBack={handleBackToGrid}
        onGoHome={onGoHome || handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource?.toolType === 'lesson-plan' ? (activeResource as LessonPlanResource) : undefined}
      />
    );
  }

  if (activeTool === 'presentation') {
    return (
      <PresentationGenerator
        onBack={handleBackToGrid}
        onGoHome={onGoHome || handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource?.toolType === 'presentation' ? (activeResource as PresentationResource) : undefined}
      />
    );
  }

  if (activeTool === 'course-builder' || activeTool === 'course') {
    return (
      <CourseBuilder
        onBack={handleBackToGrid}
        onGoHome={onGoHome || handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={(activeResource?.toolType === 'course-builder' || activeResource?.toolType === 'course') ? (activeResource as CourseResource) : undefined}
      />
    );
  }

  if (activeTool === 'learning-path') {
    return (
      <LearningPathBuilder
        onBack={handleBackToGrid}
        onGoHome={onGoHome || handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource?.toolType === 'learning-path' ? (activeResource as LearningPathResource) : undefined}
      />
    );
  }

  return (
    <BuildHome
      onSelectTool={handleSelectTool}
      onOpenMyResources={() => setActiveTool('my-resources')}
      savedCount={savedCount}
    />
  );
};

export default BuildApp;

