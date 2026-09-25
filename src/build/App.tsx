import React, { useState, useEffect } from 'react';
import { SavedResource } from './types';
import { BuildHero } from './components/BuildHero';
import { BuildThreeWaysSection } from './components/BuildThreeWaysSection';
import { AllGeneratorsSection } from './components/AllGeneratorsSection';
import { BuildFaqSection } from './components/BuildFaqSection';
import { BuildGeneratorView } from './components/BuildGeneratorView';
import { BuildToolsMenu } from './components/BuildToolsMenu';

interface BuildAppProps {
  initialResource?: SavedResource | null;
  onGoHome?: () => void;
  onBack?: () => void;
}

export default function BuildApp({ initialResource, onGoHome, onBack }: BuildAppProps) {
  const [activeMethod, setActiveMethod] = useState<'topic' | 'text' | 'pdf' | 'capture'>('topic');
  const [activeTool, setActiveTool] = useState<string | null>(initialResource ? (initialResource.toolType || 'exam') : null);
  const [activeResource, setActiveResource] = useState<SavedResource | null>(initialResource || null);
  const [selectedTopic, setSelectedTopic] = useState<string>(initialResource?.topic || '');

  useEffect(() => {
    if (initialResource) {
      setActiveResource(initialResource);
      setActiveTool(initialResource.toolType || 'exam');
    }
  }, [initialResource]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTool]);

  const handleSelectTool = (toolId: string, topic?: string) => {
    if (topic) {
      setSelectedTopic(topic);
    }
    setActiveTool(toolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectInspiration = (topic: string) => {
    setSelectedTopic(topic);
    setActiveTool('classroompack');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenGenerator = (type: string = 'classroompack') => {
    setActiveTool(type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMethod = (method: 'topic' | 'text' | 'pdf' | 'capture') => {
    setActiveMethod(method);
    if (method === 'pdf' || method === 'capture') {
      setActiveTool('worksheet');
    } else {
      setActiveTool('classroompack');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    if (activeTool !== null || activeResource !== null) {
      setActiveTool(null);
      setActiveResource(null);
    } else if (onBack) {
      onBack();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If a tool is active, render the full-page tool view with Study-style top menu toolbar
  if (activeTool !== null) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div id="build-menu-active-toolbar" className="w-full">
          <BuildToolsMenu
            activeTool={activeTool}
            onSelectTool={(toolId) => handleSelectTool(toolId)}
          />
        </div>
        <BuildGeneratorView
          activeTool={activeTool}
          onSelectTool={(toolId) => handleSelectTool(toolId)}
          onBack={handleBackToHome}
          onGoHome={onGoHome || handleBackToHome}
          initialTopic={selectedTopic}
          initialResource={activeResource}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 sm:space-y-12">
      {/* 1. Build Hero Section */}
      <BuildHero
        onSelectInspiration={handleSelectInspiration}
        onOpenGenerator={handleOpenGenerator}
        onUploadClick={() => handleSelectMethod('pdf')}
      />

      {/* 2. Primary Build Tools Menu */}
      <div id="build-menu-entry-point" className="w-full">
        <BuildToolsMenu
          activeTool={''}
          onSelectTool={handleOpenGenerator}
        />
      </div>

      {/* 3. Four Ways To Create Section */}
      <BuildThreeWaysSection
        activeMethod={activeMethod}
        onSelectMethod={handleSelectMethod}
      />

      {/* 4. All 6 Generators Suite Section */}
      <AllGeneratorsSection
        onSelectTool={handleOpenGenerator}
      />

      {/* 5. Frequently Asked Questions Section */}
      <BuildFaqSection />
    </div>
  );
}
