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

export const BuildApp: React.FC = () => {
  const [activeTool, setActiveTool] = useState<BuildToolType | 'my-resources' | null>(null);
  const [activeResource, setActiveResource] = useState<SavedResource | null>(null);
  const [savedCount, setSavedCount] = useState<number>(getSavedResources().length);

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
        onOpenResource={handleOpenSavedResource}
      />
    );
  }

  if (activeTool === 'exam') {
    return (
      <ExamGenerator
        onBack={handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource?.toolType === 'exam' ? (activeResource as ExamPaper) : undefined}
      />
    );
  }

  if (activeTool === 'worksheet') {
    return (
      <WorksheetGenerator
        onBack={handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource?.toolType === 'worksheet' ? (activeResource as WorksheetResource) : undefined}
      />
    );
  }

  if (activeTool === 'mind-map') {
    return (
      <MindMapGenerator
        onBack={handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource?.toolType === 'mind-map' ? (activeResource as MindMapResource) : undefined}
      />
    );
  }

  if (activeTool === 'pdf-studypack') {
    return (
      <PdfStudyPackGenerator
        onBack={handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource?.toolType === 'pdf-studypack' ? (activeResource as StudyPackResource) : undefined}
      />
    );
  }

  if (activeTool === 'lesson-plan') {
    return (
      <LessonPlanGenerator
        onBack={handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource?.toolType === 'lesson-plan' ? (activeResource as LessonPlanResource) : undefined}
      />
    );
  }

  if (activeTool === 'presentation') {
    return (
      <PresentationGenerator
        onBack={handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource?.toolType === 'presentation' ? (activeResource as PresentationResource) : undefined}
      />
    );
  }

  if (activeTool === 'course-builder') {
    return (
      <CourseBuilder
        onBack={handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource?.toolType === 'course-builder' ? (activeResource as CourseResource) : undefined}
      />
    );
  }

  if (activeTool === 'learning-path') {
    return (
      <LearningPathBuilder
        onBack={handleBackToGrid}
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

