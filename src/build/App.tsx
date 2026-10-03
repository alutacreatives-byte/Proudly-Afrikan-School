import React, { useState } from 'react';
import { SavedResource } from './types';
import { BuildStorage } from './utils/storage';
import { BuildGeneratorView } from './components/BuildGeneratorView';
import { BuildInteractivePresentation } from './components/BuildInteractivePresentation';
import { Plus, Sparkles, Layers, Trash2, Home, ArrowLeft } from 'lucide-react';

interface BuildAppProps {
  initialResource?: SavedResource | null;
  onGoHome?: () => void;
  onBack?: () => void;
}

export default function BuildApp({ initialResource, onGoHome, onBack }: BuildAppProps) {
  const [resources, setResources] = useState<SavedResource[]>(() => BuildStorage.getResources());
  const [activeResource, setActiveResource] = useState<SavedResource | null>(initialResource || resources[0] || null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(!initialResource && resources.length === 0);

  const handleResourceCreated = (res: SavedResource) => {
    const updated = BuildStorage.getResources();
    setResources(updated);
    setActiveResource(res);
    setActiveSlideIndex(0);
    setIsCreatingNew(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    BuildStorage.deleteResource(id);
    const updated = BuildStorage.getResources();
    setResources(updated);
    if (activeResource?.id === id) {
      setActiveResource(updated[0] || null);
      setIsCreatingNew(updated.length === 0);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans p-4 sm:p-8 space-y-8">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {onGoHome && (
              <button
                type="button"
                onClick={onGoHome}
                className="p-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 cursor-pointer"
                title="Go Home"
              >
                <Home className="w-4 h-4" />
              </button>
            )}
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 cursor-pointer"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <span className="px-3 py-1 rounded-full bg-orange-100 text-[#E05A2B] font-mono text-xs font-bold uppercase">
              BUILD MODULE
            </span>
            <span className="font-mono text-xs text-stone-500">• AI Slide Decks & Resources</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-stone-900 uppercase tracking-tight">
            Interactive Presentation Studio
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsCreatingNew(true)}
          className="px-5 py-2.5 bg-[#E05A2B] hover:bg-[#c94d22] text-white font-display font-bold text-xs uppercase rounded-full shadow-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Resource</span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Resource List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold uppercase text-stone-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#E05A2B]" />
              <span>Saved Decks ({resources.length})</span>
            </h3>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {resources.map((res) => {
              const isActive = !isCreatingNew && activeResource?.id === res.id;
              return (
                <div
                  key={res.id}
                  onClick={() => {
                    setActiveResource(res);
                    setActiveSlideIndex(0);
                    setIsCreatingNew(false);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isActive
                      ? 'border-[#E05A2B] bg-white shadow-md ring-2 ring-[#E05A2B]/30'
                      : 'border-stone-200 bg-white/60 hover:bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <span className="font-mono text-[10px] font-bold text-[#E05A2B] uppercase block">
                      {res.subject || 'Domain'}
                    </span>
                    <h4 className="font-display font-black text-sm text-stone-900 truncate">
                      {res.title}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(res.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                    title="Delete resource"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {resources.length === 0 && (
              <div className="p-6 text-center bg-white border border-stone-200 rounded-2xl space-y-2">
                <p className="font-mono text-xs text-stone-500">No saved decks yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {isCreatingNew ? (
            <BuildGeneratorView onResourceCreated={handleResourceCreated} />
          ) : activeResource ? (
            <BuildInteractivePresentation
              resource={activeResource}
              activeSlideIndex={activeSlideIndex}
              setActiveSlideIndex={setActiveSlideIndex}
              showSpeakerNotes={showSpeakerNotes}
              setShowSpeakerNotes={setShowSpeakerNotes}
              isFullscreen={isFullscreen}
              setIsFullscreen={setIsFullscreen}
            />
          ) : (
            <div className="p-12 text-center bg-white border border-stone-200 rounded-3xl space-y-4">
              <Sparkles className="w-10 h-10 text-[#E05A2B] mx-auto" />
              <h3 className="font-display font-black text-xl text-stone-900">
                Get Started with Build
              </h3>
              <p className="font-sans text-sm text-stone-600">
                Click "New Resource" above to generate your first interactive presentation deck.
              </p>
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="px-6 py-3 bg-stone-900 hover:bg-black text-white font-display font-bold text-xs uppercase rounded-full cursor-pointer transition-all"
              >
                Create New Resource →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
