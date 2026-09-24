import React, { useState } from 'react';
import { SavedResource } from './types';
import { BuildHero } from './components/BuildHero';
import { BuildToolsMenu } from './components/BuildToolsMenu';
import { AllGeneratorsSection } from './components/AllGeneratorsSection';
import { BuildThreeWaysSection } from './components/BuildThreeWaysSection';
import { BuildGeneratorView } from './components/BuildGeneratorView';
import { BuildFaqSection } from './components/BuildFaqSection';

export interface BuildAppProps {
  initialResource?: SavedResource | null;
  onGoHome?: () => void;
  onBack?: () => void;
}

export default function BuildApp({ initialResource, onGoHome, onBack }: BuildAppProps) {
  const [activeTool, setActiveTool] = useState<string | null>(
    initialResource ? initialResource.toolType : null
  );
  const [selectedTopic, setSelectedTopic] = useState<string>(initialResource?.topic || '');

  const handleSelectTool = (toolId: string) => {
    setActiveTool(toolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectInspiration = (topic: string) => {
    setSelectedTopic(topic);
    setActiveTool('course');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMenu = () => {
    if (activeTool) {
      setActiveTool(null);
    } else if (onBack) {
      onBack();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (activeTool) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BuildGeneratorView
          activeTool={activeTool}
          onSelectTool={handleSelectTool}
          onBack={handleBackToMenu}
          onGoHome={onGoHome}
          initialTopic={selectedTopic}
          initialResource={initialResource}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <BuildHero
        onSelectInspiration={handleSelectInspiration}
        onOpenGenerator={(toolId) => handleSelectTool(toolId || 'course')}
        onUploadClick={() => handleSelectTool('classroompack')}
      />

      <BuildToolsMenu
        activeTool={activeTool || ''}
        onSelectTool={handleSelectTool}
      />

      <BuildThreeWaysSection
        onSelectMethod={() => handleSelectTool('course')}
      />

      <AllGeneratorsSection
        onSelectTool={handleSelectTool}
      />

      <BuildFaqSection />
    </div>
  );
}
