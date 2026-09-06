import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  CheckCircle2
} from 'lucide-react';
import { WorksheetResource } from '../../types';
import { SUBJECT_CATEGORIES, GRADE_LEVELS, DIFFICULTY_LEVELS } from '../../data/subjects';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface WorksheetGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: WorksheetResource;
}

export const WorksheetGenerator: React.FC<WorksheetGeneratorProps> = ({
  onBack,
  onGoHome,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [subject, setSubject] = useState<string>(existingResource?.subject || 'Sciences & STEM');
  const [topic, setTopic] = useState<string>(existingResource?.topic || '');
  const [gradeLevel, setGradeLevel] = useState<string>(existingResource?.gradeLevel || 'Junior Secondary / Middle School (Grades 6-8)');
  const [difficulty, setDifficulty] = useState<string>(existingResource?.difficulty || 'Intermediate');
  const [sourceMaterial, setSourceMaterial] = useState<string>('');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.sourceDocName || '');

  // UI & Output States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [worksheet, setWorksheet] = useState<WorksheetResource | null>(existingResource || null);
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingResource) {
      setWorksheet(existingResource);
      if (existingResource.subject) setSubject(existingResource.subject);
      if (existingResource.topic) setTopic(existingResource.topic);
      if (existingResource.gradeLevel) setGradeLevel(existingResource.gradeLevel);
      if (existingResource.difficulty) setDifficulty(existingResource.difficulty);
      if (existingResource.sourceDocName) setSourceFileName(existingResource.sourceDocName);
    }
  }, [existingResource]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a worksheet topic.');
      return;
    }

    if (!canAfford('WORKSHEET')) {
      setError('Insufficient credits for Worksheet generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate/worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          gradeLevel,
          difficulty,
          sourceMaterial,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate worksheet.');
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        const generatedWorksheet: WorksheetResource = {
          ...resData.data,
          sourceDocName: sourceFileName || undefined,
          toolType: 'worksheet',
        };
        setWorksheet(generatedWorksheet);
        saveResourceToStorage(generatedWorksheet);
        if (onSaved) onSaved();
        await consumeCredits('WORKSHEET', `Generated Worksheet: ${topic}`);
      } else {
        throw new Error(resData.error || 'Invalid worksheet output from server.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!worksheet) return;
    saveResourceToStorage(worksheet);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!worksheet) return;
    let fullText = `${worksheet.title.toUpperCase()}\n`;
    fullText += `Subject: ${worksheet.subject} | Grade: ${worksheet.gradeLevel} | Est Time: ${worksheet.estimatedDurationMinutes} mins | Total: ${worksheet.totalMarks} Marks\n\n`;
    if (worksheet.instructions) fullText += `STUDENT INSTRUCTIONS:\n${worksheet.instructions}\n\n`;
    worksheet.sections.forEach((sec) => {
      fullText += `=== ${sec.title.toUpperCase()} (${sec.marks} Marks) ===\n`;
      if (sec.instructions) fullText += `${sec.instructions}\n`;
      sec.items.forEach((item, idx) => {
        fullText += `${idx + 1}. ${item.prompt}\n`;
        if (showAnswerKey && item.expectedAnswer) {
          fullText += `   [ANSWER KEY]: ${item.expectedAnswer}\n`;
        }
      });
      fullText += '\n';
    });

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div className="flex items-center gap-4">
          <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E63956]"></span>
              <span className="font-mono text-base font-bold uppercase tracking-wider text-[#E63956]">
                GENERATOR 02 • CLASSROOM WORKSHEETS
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
              Worksheet Generator
            </h1>
          </div>
        </div>

        {worksheet && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAnswerKey(!showAnswerKey)}
              className={`px-4 py-2 rounded-full font-mono text-base font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                showAnswerKey
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-200 font-mono text-base font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-200 font-mono text-base font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-full bg-[#161616] hover:bg-stone-800 text-white font-mono text-base font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4 text-[#E63956]" />}
              <span>{saved ? 'Saved!' : 'Save Build'}</span>
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
              <span className="w-3 h-3 rounded-full bg-[#E63956]"></span>
              TOOL OPTIONS
            </h2>
            <span className="font-mono text-base text-stone-500">Worksheet Parameters & Topics</span>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subject Domain */}
              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700">
                  Subject Domain
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-base text-stone-800 focus:outline-none focus:border-[#E63956]"
                >
                  {SUBJECT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Worksheet Topic */}
              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700">
                  Worksheet Topic *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Fractions, Photosynthesis, Ancient Mali"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-sans text-base text-stone-900 focus:outline-none focus:border-[#E63956]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700">
                  Grade Level
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-base text-stone-800 focus:outline-none focus:border-[#E63956]"
                >
                  {GRADE_LEVELS.map((gl) => (
                    <option key={gl} value={gl}>
                      {gl}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-base text-stone-800 focus:outline-none focus:border-[#E63956]"
                >
                  {DIFFICULTY_LEVELS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700 block">
                Attach Source Notes / Document (Optional)
              </label>
              <SourceMaterialUpload
                currentFileName={sourceFileName}
                onContentExtracted={(text, name) => {
                  setSourceMaterial(text);
                  setSourceFileName(name);
                }}
                onClear={() => {
                  setSourceMaterial('');
                  setSourceFileName('');
                }}
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl font-mono text-base text-rose-700">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] hover:opacity-95 text-white font-display text-base font-black uppercase tracking-wider shadow-[0_6px_20px_rgba(230,57,86,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isGenerating ? 'Synthesizing Worksheet...' : 'Generate Worksheet'}</span>
            </button>
          </div>
        </div>

        {/* Section 2: GENERATED RESULT */}
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
            <h2 className="font-mono text-base sm:text-lg font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              GENERATED RESULT
            </h2>
            {worksheet && (
              <span className="font-mono text-base text-emerald-700 font-bold">
                Worksheet Ready
              </span>
            )}
          </div>

          {worksheet ? (
            <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
              <div className="border-b-2 border-stone-800 pb-5 text-center space-y-2">
                <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
                  {worksheet.title}
                </h2>
                <div className="flex items-center justify-center flex-wrap gap-4 font-mono text-sm font-bold text-stone-700 pt-2">
                  <span>SUBJECT: {worksheet.subject}</span>
                  <span>•</span>
                  <span>GRADE: {worksheet.gradeLevel}</span>
                  <span>•</span>
                  <span>EST. TIME: {worksheet.estimatedDurationMinutes} MINS</span>
                  <span>•</span>
                  <span>TOTAL: {worksheet.totalMarks} MARKS</span>
                </div>
              </div>

              {worksheet.instructions && (
                <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl">
                  <div className="font-mono text-sm font-black uppercase tracking-wider text-stone-800 mb-1">
                    STUDENT INSTRUCTIONS:
                  </div>
                  <p className="font-mono text-sm text-stone-700 leading-relaxed">
                    {worksheet.instructions}
                  </p>
                </div>
              )}

              <div className="space-y-8">
                {worksheet.sections.map((sec, sIdx) => (
                  <div key={sec.id || sIdx} className="space-y-4">
                    <div className="border-b border-stone-200 pb-2 flex items-center justify-between">
                      <h3 className="font-display font-black text-lg uppercase tracking-tight text-[#161616]">
                        {sec.title}
                      </h3>
                      <span className="font-mono text-sm font-bold text-[#E63956]">
                        [{sec.marks} MARKS]
                      </span>
                    </div>
                    {sec.instructions && (
                      <p className="font-mono text-sm text-stone-600 italic">
                        {sec.instructions}
                      </p>
                    )}

                    <div className="space-y-4">
                      {sec.items.map((item, iIdx) => (
                        <div key={item.id || iIdx} className="p-5 bg-[#FAF8F5] border border-stone-200 rounded-2xl space-y-3">
                          <div className="font-sans text-base font-semibold text-stone-900 leading-relaxed">
                            <span className="font-display font-black text-[#161616] mr-2">
                              {iIdx + 1}.
                            </span>
                            {item.prompt}
                          </div>

                          {showAnswerKey && item.expectedAnswer && (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                              <div className="flex items-center gap-1.5 font-mono text-xs font-black uppercase text-emerald-800">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>ANSWER KEY:</span>
                              </div>
                              <div className="font-mono text-sm text-emerald-900 font-bold">
                                {item.expectedAnswer}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[350px]">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="font-display font-black text-xl text-[#161616] uppercase">
                  Worksheet Preview
                </h3>
                <p className="font-sans text-base text-stone-500 leading-relaxed">
                  Enter your topic above and click <strong>Generate Worksheet</strong> to synthesize classroom activities, practice items, and answer keys.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
