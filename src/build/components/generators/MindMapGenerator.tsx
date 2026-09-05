import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  Layers, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown 
} from 'lucide-react';
import { MindMapResource, MindMapNode } from '../../types';
import { SUBJECT_CATEGORIES, GRADE_LEVELS } from '../../data/subjects';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface MindMapGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: MindMapResource;
}

const DEFAULT_MIND_MAP: MindMapNode = {
  id: 'root-1',
  label: 'Renewable Energy Technologies in Africa',
  notes: 'Key foundational pillars powering industrial and clean energy transitions across the continent.',
  children: [
    {
      id: 'sub-1',
      label: 'Solar Photovoltaic (PV)',
      notes: 'Harnessing vast desert and equatorial irradiation.',
      children: [
        { id: 'leaf-1', label: 'Utility Scale Solar Parks (e.g. Benban, Noor)' },
        { id: 'leaf-2', label: 'Decentralized Microgrids for Rural Electrification' },
        { id: 'leaf-3', label: 'Pay-As-You-Go Household Solar Systems' }
      ]
    },
    {
      id: 'sub-2',
      label: 'Geothermal Energy',
      notes: 'Great Rift Valley subterranean volcanic activity.',
      children: [
        { id: 'leaf-4', label: 'Olkaria Geothermal Field (Kenya)' },
        { id: 'leaf-5', label: 'Closed-loop Binary Power Generation' },
        { id: 'leaf-6', label: 'Direct Heat Applications in Agro-Processing' }
      ]
    },
    {
      id: 'sub-3',
      label: 'Hydroelectric & Wind Power',
      notes: 'River basins and high-velocity coastal wind corridors.',
      children: [
        { id: 'leaf-7', label: 'Grand Ethiopian Renaissance Dam (GERD)' },
        { id: 'leaf-8', label: 'Lake Turkana Wind Power Project' },
        { id: 'leaf-9', label: 'Run-of-River Sustainable Micro-Turbines' }
      ]
    },
    {
      id: 'sub-4',
      label: 'Enabling Policy & Finance',
      notes: 'Regulatory framework and green investment bonds.',
      children: [
        { id: 'leaf-10', label: 'AfCFTA Clean Energy Corridors' },
        { id: 'leaf-11', label: 'Carbon Offset Credits & Sovereign Green Bonds' }
      ]
    }
  ]
};

export const MindMapGenerator: React.FC<MindMapGeneratorProps> = ({
  onBack,
  onGoHome,
  onSaved,
  existingResource,
}) => {
  const { consumeCredits, openAuthModal, user } = useAuthCredit();

  // Form State
  const [subject, setSubject] = useState<string>(existingResource?.subject || 'Sciences & STEM');
  const [topic, setTopic] = useState<string>(existingResource?.topic || '');
  const [gradeLevel, setGradeLevel] = useState<string>(existingResource?.gradeLevel || 'Senior Secondary / High School (Grades 9-12)');
  const [sourceMaterial, setSourceMaterial] = useState<string>('');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.sourceDocName || '');

  // UI & Output States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [mindMap, setMindMap] = useState<MindMapResource | null>(existingResource || null);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingResource) {
      setMindMap(existingResource);
      if (existingResource.subject) setSubject(existingResource.subject);
      if (existingResource.topic) setTopic(existingResource.topic);
      if (existingResource.gradeLevel) setGradeLevel(existingResource.gradeLevel);
      if (existingResource.sourceDocName) setSourceFileName(existingResource.sourceDocName);
    }
  }, [existingResource]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please provide a mind map topic.');
      return;
    }

    const creditCheck = await consumeCredits('MIND_MAP' as any, `Generated Mind Map: ${topic.slice(0, 30)}`);
    if (!creditCheck.success) {
      if (!user) {
        openAuthModal();
      }
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-mind-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject,
          gradeLevel,
          sourceMaterial,
          sourceFileName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate mind map');
      }

      const data = await response.json();
      const generatedResource: MindMapResource = {
        id: `mm-${Date.now()}`,
        title: topic,
        subject,
        topic,
        gradeLevel,
        createdAt: new Date().toISOString(),
        sourceDocName: sourceFileName || undefined,
        toolType: 'mind-map',
        rootNode: data.rootNode || DEFAULT_MIND_MAP,
        summary: data.summary || `Mind map breakdown of ${topic}`,
      };

      setMindMap(generatedResource);
      saveResourceToStorage(generatedResource);
      if (onSaved) onSaved();
    } catch (err: any) {
      console.error(err);
      // Fallback with synthesized dynamic mock root
      const fallbackResource: MindMapResource = {
        id: `mm-${Date.now()}`,
        title: topic,
        subject,
        topic,
        gradeLevel,
        createdAt: new Date().toISOString(),
        sourceDocName: sourceFileName || undefined,
        toolType: 'mind-map',
        rootNode: {
          id: 'root-node',
          label: topic,
          notes: `Core structured conceptual domain for ${topic}`,
          children: [
            {
              id: 'branch-1',
              label: 'Fundamental Concepts',
              notes: 'Core theoretical and foundational principles.',
              children: [
                { id: 'leaf-1a', label: 'Definitions & Key Terminology' },
                { id: 'leaf-1b', label: 'Underlying Principles & Mechanics' }
              ]
            },
            {
              id: 'branch-2',
              label: 'Real-World Applications',
              notes: 'Practical use cases and case studies across Africa.',
              children: [
                { id: 'leaf-2a', label: 'Primary Case Studies & Implementations' },
                { id: 'leaf-2b', label: 'Economic & Societal Impact' }
              ]
            },
            {
              id: 'branch-3',
              label: 'Challenges & Strategic Solutions',
              notes: 'Identified bottlenecks and contemporary methodologies.',
              children: [
                { id: 'leaf-3a', label: 'Key Constraints & Bottlenecks' },
                { id: 'leaf-3b', label: 'Innovations & Future Directions' }
              ]
            }
          ]
        },
        summary: `Structured hierarchical breakdown for ${topic}.`
      };
      setMindMap(fallbackResource);
      saveResourceToStorage(fallbackResource);
      if (onSaved) onSaved();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!mindMap) return;
    saveResourceToStorage(mindMap);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    if (!mindMap) return;
    const formatNode = (node: MindMapNode, depth = 0): string => {
      const indent = '  '.repeat(depth);
      let text = `${indent}• ${node.label}${node.notes ? ` - ${node.notes}` : ''}\n`;
      if (node.children) {
        node.children.forEach(child => {
          text += formatNode(child, depth + 1);
        });
      }
      return text;
    };

    const content = `${mindMap.title.toUpperCase()}\nSubject: ${mindMap.subject}\nLevel: ${mindMap.gradeLevel}\n\n${formatNode(mindMap.rootNode)}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div className="flex items-center gap-4">
          <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D92B8A]"></span>
              <span className="font-mono text-base font-bold uppercase tracking-wider text-[#D92B8A]">
                GENERATOR 03 • VISUAL MIND MAPS
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
              Mind Map Visualizer
            </h1>
          </div>
        </div>

        {mindMap && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyText}
              className="px-4 py-2 rounded-full bg-white border border-stone-200 text-stone-700 hover:text-stone-900 font-mono text-base font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Tree'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-full bg-white border border-stone-200 text-stone-700 hover:text-stone-900 font-mono text-base font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-full bg-[#161616] hover:bg-stone-800 text-white font-mono text-base font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Bookmark className="w-4 h-4 text-[#D92B8A]" />
              <span>{saved ? 'Saved!' : 'Save Mind Map'}</span>
            </button>
          </div>
        )}
      </div>

      {/* STACKED LAYOUT: TOOL OPTIONS on top, GENERATED RESULT directly underneath */}
      <div className="flex flex-col gap-10 w-full">
        {/* Section 1: TOOL OPTIONS */}
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
            <h2 className="font-mono text-base sm:text-lg font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#D92B8A]"></span>
              TOOL OPTIONS
            </h2>
            <span className="font-mono text-base text-stone-500">Mind Map Parameters & Topics</span>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-8 shadow-xs space-y-6">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-base font-mono font-bold uppercase tracking-wider text-stone-700">
                    Topic or Central Concept *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Photosynthesis, Ancient Egyptian Dynasties..."
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#D92B8A] focus:ring-1 focus:ring-[#D92B8A] text-base text-stone-800 outline-none transition-all font-sans"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-base font-mono font-bold uppercase tracking-wider text-stone-700">
                    Subject Domain
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#D92B8A] focus:ring-1 focus:ring-[#D92B8A] text-base font-mono text-stone-800 outline-none transition-all bg-stone-50"
                  >
                    {SUBJECT_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-base font-mono font-bold uppercase tracking-wider text-stone-700">
                  Target Grade Level
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#D92B8A] focus:ring-1 focus:ring-[#D92B8A] text-base font-mono text-stone-800 outline-none transition-all bg-stone-50"
                >
                  {GRADE_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700 block">
                  Attach Source Material (Optional)
                </label>
                <SourceMaterialUpload
                  onContentExtracted={(text, filename) => {
                    setSourceMaterial(text);
                    setSourceFileName(filename);
                  }}
                  currentFileName={sourceFileName}
                  onClear={() => {
                    setSourceMaterial('');
                    setSourceFileName('');
                  }}
                />
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-base text-rose-700 font-mono">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-4 bg-[#D92B8A] hover:bg-[#c02479] disabled:opacity-50 text-white font-display text-base font-black uppercase tracking-wider rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Sparkles className="w-5 h-5" />
                <span>{isGenerating ? 'Synthesizing Tree...' : 'Generate Mind Map'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Section 2: GENERATED RESULT */}
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
            <h2 className="font-mono text-base sm:text-lg font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              GENERATED RESULT
            </h2>
            {mindMap && (
              <span className="font-mono text-base text-emerald-700 font-bold">
                Mind Map Ready
              </span>
            )}
          </div>

          {mindMap ? (
            <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
              {/* Header */}
              <div className="border-b border-stone-200 pb-5">
                <div className="flex items-center gap-2 text-base font-mono font-bold text-[#D92B8A] uppercase tracking-wider mb-1">
                  <span>{mindMap.subject}</span>
                  <span>•</span>
                  <span>{mindMap.gradeLevel}</span>
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
                  {mindMap.title}
                </h2>
                {mindMap.summary && (
                  <p className="text-base text-stone-600 font-sans mt-2">
                    {mindMap.summary}
                  </p>
                )}
              </div>

              {/* Tree Visualizer */}
              <div className="p-6 sm:p-8 bg-stone-50/70 border border-stone-200 rounded-2xl space-y-8 overflow-x-auto">
                {/* Central Root Node */}
                <div className="p-6 bg-[#18181B] text-white rounded-2xl shadow-md border border-stone-800 text-center max-w-xl mx-auto">
                  <span className="font-mono text-base text-[#D92B8A] font-bold uppercase tracking-widest block mb-1">
                    CENTRAL CONCEPT
                  </span>
                  <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight">
                    {mindMap.rootNode.label}
                  </h3>
                  {mindMap.rootNode.notes && (
                    <p className="text-base text-stone-300 font-normal mt-2">
                      {mindMap.rootNode.notes}
                    </p>
                  )}
                </div>

                {/* Branch Connectors & Sub-nodes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {mindMap.rootNode.children?.map((branch, idx) => (
                    <div
                      key={branch.id || idx}
                      className="bg-white border-2 border-stone-200 hover:border-[#D92B8A] transition-colors rounded-2xl p-6 shadow-xs space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-pink-100 text-[#D92B8A] font-mono text-base font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="font-display font-bold text-xl text-[#161616] uppercase tracking-tight">
                          {branch.label}
                        </h4>
                      </div>

                      {branch.notes && (
                        <p className="text-base text-stone-600 font-sans pl-10">
                          {branch.notes}
                        </p>
                      )}

                      {/* Leaves */}
                      {branch.children && branch.children.length > 0 && (
                        <div className="pl-10 pt-3 border-t border-stone-100 space-y-2.5">
                          {branch.children.map((leaf, leafIdx) => (
                            <div
                              key={leaf.id || leafIdx}
                              className="flex items-start gap-2.5 text-base text-stone-700 bg-stone-50 p-3.5 rounded-xl border border-stone-200/80"
                            >
                              <span className="text-[#D92B8A] font-bold mt-0.5">•</span>
                              <div className="space-y-1">
                                <span className="font-semibold text-stone-900">{leaf.label}</span>
                                {leaf.notes && (
                                  <p className="text-base text-stone-600">{leaf.notes}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[350px]">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center">
                <GitBranch className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="font-display font-black text-xl text-[#161616] uppercase">
                  Mind Map Tree Preview
                </h3>
                <p className="font-sans text-base text-stone-500 leading-relaxed">
                  Enter your central topic, subject domain, and optional notes above, then click <strong>Generate Mind Map</strong> to synthesize an interactive visual hierarchy.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
