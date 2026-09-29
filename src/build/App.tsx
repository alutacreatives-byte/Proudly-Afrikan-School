import React, { useState, useEffect } from 'react';
import { BuildHero } from './components/BuildHero';
import { BuildThreeWaysSection } from './components/BuildThreeWaysSection';
import { BuildToolsMenu } from './components/BuildToolsMenu';
import { AllGeneratorsSection } from './components/AllGeneratorsSection';
import { BuildFaqSection } from './components/BuildFaqSection';
import { GeneratorModal } from './components/GeneratorModal';
import { BuildGeneratorView } from './components/BuildGeneratorView';
import { SavedResource, BuildToolId } from './types';

interface BuildAppProps {
  initialResource?: SavedResource | null;
  onGoHome?: () => void;
  onBack?: () => void;
}

export const BuildApp: React.FC<BuildAppProps> = ({
  initialResource = null,
  onGoHome,
  onBack,
}) => {
  const [currentView, setCurrentView] = useState<'hub' | 'generator'>(
    initialResource ? 'generator' : 'hub'
  );
  const [selectedTool, setSelectedTool] = useState<BuildToolId>(
    initialResource?.toolType || 'exam'
  );
  const [selectedTopic, setSelectedTopic] = useState<string>(
    initialResource?.topic || initialResource?.title || ''
  );
  const [threeWaysMethod, setThreeWaysMethod] = useState<'topic' | 'text' | 'pdf' | 'capture'>('topic');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTool, setModalTool] = useState<string>('exam');
  const [modalTopic, setModalTopic] = useState<string>('');

  useEffect(() => {
    if (initialResource) {
      setCurrentView('generator');
      setSelectedTool(initialResource.toolType || 'exam');
      setSelectedTopic(initialResource.topic || initialResource.title || '');
    }
  }, [initialResource]);

  const handleSelectTool = (toolId: string) => {
    setSelectedTool(toolId as BuildToolId);
    setCurrentView('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectInspiration = (topic: string) => {
    setSelectedTopic(topic);
    setSelectedTool('exam');
    setCurrentView('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenGeneratorModal = (generatorType = 'exam') => {
    setModalTool(generatorType);
    setModalTopic(selectedTopic);
    setIsModalOpen(true);
  };

  const handleUploadClick = () => {
    setSelectedTool('exam');
    setCurrentView('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentView === 'generator') {
    return (
      <BuildGeneratorView
        initialToolId={selectedTool}
        initialTopic={selectedTopic}
        initialResource={initialResource}
        onBack={() => {
          if (initialResource && onBack) {
            onBack();
          } else {
            setCurrentView('hub');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onGoHome={onGoHome}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <BuildHero
        onStartClick={() => handleSelectTool('exam')}
        onSelectInspiration={handleSelectInspiration}
        onOpenGenerator={handleOpenGeneratorModal}
        onUploadClick={handleUploadClick}
      />

      {/* Horizontal Tool Selector Menu */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold uppercase text-stone-500 tracking-wider">
            Quick Tool Selection
          </span>
          <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
            6 Specialized Generators
          </span>
        </div>
        <BuildToolsMenu
          activeTool={null}
          onSelectTool={handleSelectTool}
        />
      </div>

      {/* Four Ways Section */}
      <BuildThreeWaysSection
        activeMethod={threeWaysMethod}
        onSelectMethod={(method) => {
          setThreeWaysMethod(method);
          handleSelectTool('exam');
        }}
      />

      {/* Complete Suite Grid */}
      <AllGeneratorsSection
        onSelectGenerator={handleSelectTool}
        onSelectTool={handleSelectTool}
      />

      {/* FAQ & Capabilities */}
      <BuildFaqSection />

      {/* Legacy or Quick Modal Support */}
      <GeneratorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialGeneratorType={modalTool}
        initialTopic={modalTopic}
        onResourceSaved={(res) => {
          setIsModalOpen(false);
          setSelectedTool(res.toolType || 'exam');
          setCurrentView('generator');
        }}
      />
    </div>
  );
};

export default BuildApp;
