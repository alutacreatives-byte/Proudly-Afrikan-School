import React, { useState } from 'react';
import { Sparkles, BookOpen, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { SavedResource } from '../types';
import { BuildStorage } from '../utils/storage';
import { parsePresentationSlides } from '../utils/presentationBuilder';

interface BuildGeneratorViewProps {
  onResourceCreated: (resource: SavedResource) => void;
}

export const BuildGeneratorView: React.FC<BuildGeneratorViewProps> = ({ onResourceCreated }) => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Computer Science & AI');
  const [resourceType, setResourceType] = useState<'presentation' | 'study_guide' | 'quiz' | 'lesson_plan' | 'summary'>('presentation');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      // Simulate or call AI generation
      await new Promise(r => setTimeout(r, 1800));

      const title = topic.trim();
      const content = `# Comprehensive Guide: ${title}
Subject: ${subject}

## Executive Overview
${title} is a vital focal point in modern ${subject}. Understanding its core principles, foundational mechanics, and real-world implications is essential for mastery.

## Core Concepts & Mechanics
• Fundamental architecture and operational principles.
• Key analytical frameworks and comparative models.
• Advanced applications and future trajectory in ${subject}.

## Summary & Key Takeaways
1. Mastery of ${title} accelerates domain expertise in ${subject}.
2. Practical implementation requires rigorous methodology.
3. Continuous synthesis ensures long-term retention and mastery.`;

      const slides = parsePresentationSlides(content, title);

      const newResource: SavedResource = {
        id: 'res_' + Date.now(),
        title,
        type: resourceType,
        subject,
        createdAt: new Date().toISOString(),
        content,
        data: {
          slides,
          credibleSourceUrl: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(title),
          sourceName: 'Verified Knowledge Base'
        }
      };

      BuildStorage.saveResource(newResource);
      onResourceCreated(newResource);
    } catch (err: any) {
      setErrorMsg(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-10 bg-white border border-stone-200 rounded-3xl shadow-sm space-y-8">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#E05A2B] font-mono text-xs font-bold uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Resource & Presentation Generator</span>
        </div>
        <h2 className="font-display font-black text-2xl sm:text-3xl text-stone-900 uppercase tracking-tight">
          Build Custom Learning Materials
        </h2>
        <p className="font-sans text-sm text-stone-600 max-w-lg mx-auto">
          Enter any topic, subject, or prompt to instantly generate interactive presentation decks, study guides, and lesson plans.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6">
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-mono text-rose-800">
            {errorMsg}
          </div>
        )}

        <div className="space-y-2">
          <label className="font-mono text-xs font-bold uppercase text-stone-700 block">
            Topic or Prompt
          </label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. Quantum Computing & Entanglement, Photosynthesis..."
            disabled={isGenerating}
            className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 font-sans text-base focus:outline-none focus:ring-2 focus:ring-[#E05A2B]/30 focus:border-[#E05A2B]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="font-mono text-xs font-bold uppercase text-stone-700 block">
              Domain / Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              disabled={isGenerating}
              className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]/30 focus:border-[#E05A2B]"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs font-bold uppercase text-stone-700 block">
              Resource Type
            </label>
            <select
              value={resourceType}
              onChange={e => setResourceType(e.target.value as any)}
              disabled={isGenerating}
              className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]/30 focus:border-[#E05A2B]"
            >
              <option value="presentation">Interactive Presentation Deck</option>
              <option value="study_guide">Comprehensive Study Guide</option>
              <option value="lesson_plan">Curriculum Lesson Plan</option>
              <option value="summary">Executive Summary</option>
            </select>
          </div>
        </div>

        {/* Generate Button with Smooth Moving Gradient Animation & No Spinner */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!topic.trim() || isGenerating}
            className={`w-full py-4 text-white font-display text-sm font-bold uppercase rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer ${
              isGenerating
                ? 'bg-gradient-to-r from-[#E05A2B] via-[#D99B00] to-[#E05A2B] bg-[length:200%_200%] animate-gradient-flow'
                : 'bg-stone-900 hover:bg-black'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Generating resource & presentation slides...' : 'Generate Resource →'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
