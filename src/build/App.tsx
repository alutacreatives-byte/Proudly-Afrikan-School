import React, { useState, useEffect } from 'react';
import { BuildToolType } from './types';
import { BuildHome } from './components/BuildHome';
import { ExamGenerator } from './components/generators/ExamGenerator';
import { WorksheetGenerator } from './components/generators/WorksheetGenerator';
import { LessonPlanGenerator } from './components/generators/LessonPlanGenerator';
import { PresentationDeckGenerator } from './components/generators/PresentationDeckGenerator';
import { CourseBuilderGenerator } from './components/generators/CourseBuilderGenerator';
import { LearningPathGenerator } from './components/generators/LearningPathGenerator';
import { PdfQuizBuildGenerator } from './components/generators/PdfQuizBuildGenerator';
import { PdfStudyPackGenerator } from './components/generators/PdfStudyPackGenerator';
import { BuildMyResources } from './components/BuildMyResources';
import { getSavedResources } from './utils/storage';

interface BuildAppProps {
  onGoHome?: () => void;
  onNavigateToStudy?: () => void;
  initialResource?: any;
  initialTool?: BuildToolType;
}

export const BuildApp: React.FC<BuildAppProps> = ({
  onGoHome,
  onNavigateToStudy,
  initialResource,
  initialTool,
}) => {
  const [activeView, setActiveView] = useState<BuildToolType | 'home' | 'my-resources'>('home');
  const [activeResource, setActiveResource] = useState<any | null>(null);
  const [savedCount, setSavedCount] = useState<number>(getSavedResources().length);

  // Sync initial resource or tool on mount or changes
  useEffect(() => {
    if (initialResource) {
      const toolType = initialResource.toolType;
      setActiveResource(initialResource.data || initialResource);
      if (
        toolType === 'exam' ||
        toolType === 'worksheet' ||
        toolType === 'lesson-plan' ||
        toolType === 'presentation' ||
        toolType === 'course' ||
        toolType === 'learning-path' ||
        toolType === 'pdf-quiz' ||
        toolType === 'pdf-studypack'
      ) {
        setActiveView(toolType);
      }
    } else if (initialTool) {
      setActiveView(initialTool);
    }
  }, [initialResource, initialTool]);

  const refreshSavedCount = () => {
    setSavedCount(getSavedResources().length);
  };

  const handleSelectTool = (
    toolId: BuildToolType,
    prefillTopic?: string,
    prefillSubject?: string,
    sourceMaterial?: string,
    sourceFileName?: string
  ) => {
    if (prefillTopic || prefillSubject || sourceMaterial) {
      setActiveResource({
        title: prefillTopic,
        topic: prefillTopic,
        subject: prefillSubject,
        sourceSnippet: sourceMaterial,
        documentName: sourceFileName,
      });
    } else {
      setActiveResource(null);
    }
    setActiveView(toolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSavedResource = (res: any) => {
    const data = res.data || res;
    setActiveResource(data);
    const toolType = res.toolType;
    if (
      toolType === 'exam' ||
      toolType === 'worksheet' ||
      toolType === 'lesson-plan' ||
      toolType === 'presentation' ||
      toolType === 'course' ||
      toolType === 'learning-path' ||
      toolType === 'pdf-quiz' ||
      toolType === 'pdf-studypack'
    ) {
      setActiveView(toolType);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setActiveView('home');
    setActiveResource(null);
    refreshSavedCount();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render view based on activeView
  switch (activeView) {
    case 'exam':
      return (
        <ExamGenerator
          onBack={handleBackToHome}
          onGoHome={onGoHome}
          onSaved={refreshSavedCount}
          existingResource={activeResource}
        />
      );

    case 'worksheet':
      return (
        <WorksheetGenerator
          onBack={handleBackToHome}
          onGoHome={onGoHome}
          onSaved={refreshSavedCount}
          existingResource={activeResource}
        />
      );

    case 'lesson-plan':
      return (
        <LessonPlanGenerator
          onBack={handleBackToHome}
          onGoHome={onGoHome}
          onSaved={refreshSavedCount}
          existingResource={activeResource}
        />
      );

    case 'presentation':
      return (
        <PresentationDeckGenerator
          onBack={handleBackToHome}
          onGoHome={onGoHome}
          onSaved={refreshSavedCount}
          existingResource={activeResource}
        />
      );

    case 'course':
      return (
        <CourseBuilderGenerator
          onBack={handleBackToHome}
          onGoHome={onGoHome}
          onSaved={refreshSavedCount}
          existingResource={activeResource}
        />
      );

    case 'learning-path':
      return (
        <LearningPathGenerator
          onBack={handleBackToHome}
          onGoHome={onGoHome}
          onSaved={refreshSavedCount}
          existingResource={activeResource}
        />
      );

    case 'pdf-quiz':
      return (
        <PdfQuizBuildGenerator
          onBack={handleBackToHome}
          onGoHome={onGoHome}
          onSaved={refreshSavedCount}
          existingResource={activeResource}
        />
      );

    case 'pdf-studypack':
      return (
        <PdfStudyPackGenerator
          onBack={handleBackToHome}
          onGoHome={onGoHome}
          onSaved={refreshSavedCount}
          existingResource={activeResource}
        />
      );

    case 'my-resources':
      return (
        <BuildMyResources
          onBack={handleBackToHome}
          onGoHome={onGoHome}
          onOpenResource={handleOpenSavedResource}
        />
      );

    case 'home':
    default:
      return (
        <BuildHome
          onSelectTool={handleSelectTool}
          onOpenMyResources={() => setActiveView('my-resources')}
          savedCount={savedCount}
        />
      );
  }
};

export default BuildApp;
