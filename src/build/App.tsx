import React, { useState } from 'react';
import { BuildToolsMenu } from './components/BuildToolsMenu';
import { BuildGeneratorView } from './components/BuildGeneratorView';
import { SavedResource } from './types';
import { GlobalNavigationButtons } from '../components/GlobalNavigationButtons';
import { Sparkles, Layers, ArrowLeft } from 'lucide-react';

interface BuildAppProps {
  initialResource?: SavedResource | null;
  onNavigateToTab?: (tab: 'STUDY' | 'QUIZ' | 'BUILD' | 'MY SETS' | 'PLANNER') => void;
  onGoHome?: () => void;
  onBack?: () => void;
}

export default function BuildApp({
  initialResource,
  onNavigateToTab,
  onGoHome,
  onBack,
}: BuildAppProps = {}) {
  const [activeTool, setActiveTool] = useState<string | null>(initialResource ? initialResource.toolType : null);
  const [selectedResource, setSelectedResource] = useState<SavedResource | null>(initialResource || null);

  const handleSelectTool = (toolId: string) => {
    setActiveTool(toolId);
    setSelectedResource(null);
  };

  const handleBack = () => {
    if (activeTool) {
      setActiveTool(null);
      setSelectedResource(null);
    } else if (onBack) {
      onBack();
    } else if (onNavigateToTab) {
      onNavigateToTab('STUDY');
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else if (onNavigateToTab) {
      onNavigateToTab('STUDY');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-stone-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center justify-between mb-8">
          <GlobalNavigationButtons
            onBack={activeTool ? handleBack : undefined}
            onGoHome={handleGoHome}
            backLabel="Back"
            homeLabel="Home"
          />
        </div>

        {activeTool ? (
          <BuildGeneratorView
            activeTool={activeTool}
            initialResource={selectedResource}
            onSelectTool={(toolId) => setActiveTool(toolId)}
            onBack={() => {
              setActiveTool(null);
              setSelectedResource(null);
            }}
            onGoHome={handleGoHome}
          />
        ) : (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 font-mono text-xs mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Educator Studio & Generator Hub</span>
                </div>
                <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl mb-4 tracking-tight">
                  Build Professional Educational Content
                </h1>
                <p className="font-mono text-sm sm:text-base text-stone-300 leading-relaxed">
                  Instantly craft rigorous exams, comprehensive study guides, interactive presentations, student worksheets, and lesson plans powered by advanced AI and pedagogical standards.
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-stone-900">Creation Tools</h2>
                  <p className="font-mono text-xs text-stone-600">Select a tool to start generating custom materials</p>
                </div>
              </div>
              <BuildToolsMenu onSelectTool={handleSelectTool} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
