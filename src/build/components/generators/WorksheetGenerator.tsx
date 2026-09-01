import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { WorksheetResource } from '../../types';
import { SUBJECT_CATEGORIES, GRADE_LEVELS, DIFFICULTY_LEVELS } from '../../data/subjects';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface WorksheetGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: WorksheetResource;
}

export const WorksheetGenerator: React.FC<WorksheetGeneratorProps> = ({
  onBack,
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
        const generated: WorksheetResource = {
          ...resData.data,
          sourceDocName: sourceFileName || undefined,
          toolType: 'worksheet',
        };
        setWorksheet(generated);
        await consumeCredits('WORKSHEET', `Generated Worksheet: ${topic}`);
      } else {
        throw new Error(resData.error || 'Server returned invalid worksheet format.');
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
    const text = `# ${worksheet.title}\nSubject: ${worksheet.subject} | Grade: ${worksheet.gradeLevel}\nInstructions: ${worksheet.instructions}\n\n` +
      worksheet.sections.map(sec => 
        `### ${sec.title} (${sec.marks} Marks)\n${sec.instructions}\n\n` +
        sec.items.map((item, idx) => 
          `${idx + 1}. ${item.prompt}\n` +
          (showAnswerKey && item.expectedAnswer ? `> Answer: ${item.expectedAnswer}` : '')
        ).join('\n\n')
      ).join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E63956]"></span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#E63956]">
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
              className={`px-4 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                showAnswerKey
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}
            </button>
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-200 font-mono text-xs font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-200 font-mono text-xs font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-full bg-[#161616] hover:bg-stone-800 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5 text-[#E63956]" />}
              <span>{saved ? 'Saved!' : 'Save Build'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-7 shadow-xs space-y-5">
            <h2 className="font-display font-black text-lg uppercase tracking-tight text-[#161616] flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#E63956]" />
              <span>Worksheet Options</span>
            </h2>

            <div className="space-y-1.5">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                Subject Domain
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-800 focus:outline-none focus:border-[#E63956]"
              >
                {SUBJECT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                Worksheet Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Fractions, Photosynthesis, Ancient Mali"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-sans text-sm text-stone-900 focus:outline-none focus:border-[#E63956]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                  Grade Level
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-800 focus:outline-none focus:border-[#E63956]"
                >
                  {GRADE_LEVELS.map((gl) => (
                    <option key={gl} value={gl}>
                      {gl}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-800 focus:outline-none focus:border-[#E63956]"
                >
                  {DIFFICULTY_LEVELS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-stone-100">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700 block">
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
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl font-mono text-xs text-rose-700">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] hover:opacity-95 text-white font-display text-sm font-black uppercase tracking-wider shadow-[0_6px_20px_rgba(230,57,86,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing Worksheet...' : 'Generate Worksheet'}</span>
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7">
          {worksheet ? (
            <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
              <div className="border-b-2 border-stone-800 pb-5 text-center space-y-2">
                <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
                  {worksheet.title}
                </h2>
                <div className="flex items-center justify-center flex-wrap gap-4 font-mono text-xs font-bold text-stone-700 pt-2">
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
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                  <div className="font-mono text-xs font-black uppercase tracking-wider text-stone-800 mb-1">
                    STUDENT INSTRUCTIONS:
                  </div>
                  <p className="font-mono text-xs text-stone-700 leading-relaxed">
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
                      <span className="font-mono text-xs font-bold text-[#E63956]">
                        [{sec.marks} MARKS]
                      </span>
                    </div>
                    {sec.instructions && (
                      <p className="font-mono text-xs text-stone-600 italic">
                        {sec.instructions}
                      </p>
                    )}

                    <div className="space-y-4">
                      {sec.items.map((item, iIdx) => (
                        <div key={item.id || iIdx} className="p-4 bg-[#FAF8F5] border border-stone-200 rounded-2xl space-y-2.5">
                          <div className="font-sans text-sm font-semibold text-stone-900 leading-relaxed">
                            <span className="font-display font-black text-[#161616] mr-2">
                              {iIdx + 1}.
                            </span>
                            {item.prompt}
                          </div>

                          {showAnswerKey && item.expectedAnswer && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                              <div className="flex items-center gap-1.5 font-mono text-[11px] font-black uppercase text-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>ANSWER KEY:</span>
                              </div>
                              <div className="font-mono text-xs text-emerald-900 font-bold">
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
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[500px]">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="font-display font-black text-lg text-[#161616] uppercase">
                  Worksheet Preview
                </h3>
                <p className="font-sans text-xs text-stone-500 leading-relaxed">
                  Enter your topic on the left and click <strong>Generate Worksheet</strong> to synthesize classroom activities, practice items, and answer keys.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
