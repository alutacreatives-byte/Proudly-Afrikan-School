import React, { useState, useEffect } from 'react';
import { BuildToolType, SavedResource, ExamPaper, WorksheetResource, MindMapResource, LessonPlanResource, PresentationResource, CourseResource, LearningPathResource } from './types';
import { BuildHome } from './components/BuildHome';
import { ExamGenerator } from './components/generators/ExamGenerator';
import { WorksheetGenerator } from './components/generators/WorksheetGenerator';
import { MindMapGenerator } from './components/generators/MindMapGenerator';
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

  // Normalize resource so inner .data is merged at top-level
  const normalizedResource = activeResource && (activeResource as any).data 
    ? { ...(activeResource as any).data, ...activeResource } 
    : activeResource;

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
        existingResource={normalizedResource?.toolType === 'exam' ? (normalizedResource as ExamPaper) : undefined}
      />
    );
  }

  if (activeTool === 'worksheet') {
    return (
      <WorksheetGenerator
        onBack={handleBackToGrid}
        onGoHome={onGoHome || handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={normalizedResource?.toolType === 'worksheet' ? (normalizedResource as WorksheetResource) : undefined}
      />
    );
  }

  if (activeTool === 'mind-map') {
    return (
      <MindMapGenerator
        onBack={handleBackToGrid}
        onGoHome={onGoHome || handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={normalizedResource?.toolType === 'mind-map' ? (normalizedResource as MindMapResource) : undefined}
      />
    );
  }

  if (activeTool === 'lesson-plan') {
    return (
      <LessonPlanGenerator
        onBack={handleBackToGrid}
        onGoHome={onGoHome || handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={normalizedResource?.toolType === 'lesson-plan' ? (normalizedResource as LessonPlanResource) : undefined}
      />
    );
  }

  if (activeTool === 'presentation') {
    return (
      <PresentationGenerator
        onBack={handleBackToGrid}
        onGoHome={onGoHome || handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={normalizedResource?.toolType === 'presentation' ? (normalizedResource as PresentationResource) : undefined}
      />
    );
  }

  if (activeTool === 'course-builder' || activeTool === 'course') {
    return (
      <CourseBuilder
        onBack={handleBackToGrid}
        onGoHome={onGoHome || handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={(normalizedResource?.toolType === 'course-builder' || normalizedResource?.toolType === 'course') ? (normalizedResource as CourseResource) : undefined}
      />
    );
  }

  if (activeTool === 'learning-path') {
    return (
      <LearningPathBuilder
        onBack={handleBackToGrid}
        onGoHome={onGoHome || handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={normalizedResource?.toolType === 'learning-path' ? (normalizedResource as LearningPathResource) : undefined}
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

