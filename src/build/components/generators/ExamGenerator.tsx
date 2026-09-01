import React, { useState } from 'react';
import { 
  FileCheck, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  ChevronDown,
  Clock,
  Award,
  Layers,
  CheckCircle2,
  FileDown
} from 'lucide-react';
import { ExamPaper, ExamSection, ExamQuestion } from '../../types';
import { SUBJECT_CATEGORIES, GRADE_LEVELS, DIFFICULTY_LEVELS } from '../../data/subjects';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface ExamGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: ExamPaper;
}

export const ExamGenerator: React.FC<ExamGeneratorProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [subject, setSubject] = useState<string>(existingResource?.subject || 'Sciences & STEM');
  const [topic, setTopic] = useState<string>(existingResource?.topic || '');
  const [gradeLevel, setGradeLevel] = useState<string>(existingResource?.gradeLevel || 'Senior Secondary / High School (Grades 9-12)');
  const [difficulty, setDifficulty] = useState<string>(existingResource?.difficulty || 'Intermediate');
  const [durationMinutes, setDurationMinutes] = useState<number>(existingResource?.durationMinutes || 60);
  const [totalMarks, setTotalMarks] = useState<number>(existingResource?.totalMarks || 50);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [institutionHeader, setInstitutionHeader] = useState<string>(existingResource?.institutionHeader || 'Proudly Afrikan Examination Board');
  const [instructions, setInstructions] = useState<string>('');
  const [sourceMaterial, setSourceMaterial] = useState<string>('');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.sourceDocName || '');

  // UI & Output States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [exam, setExam] = useState<ExamPaper | null>(existingResource || null);
  const [showMarkingGuide, setShowMarkingGuide] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter an exam topic or concept.');
      return;
    }

    if (!canAfford('EXAM')) {
      setError('Insufficient credits for Exam generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          gradeLevel,
          difficulty,
          durationMinutes,
          totalMarks,
          questionCount,
          institutionHeader,
          instructions,
          sourceMaterial,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate examination paper.');
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        const generatedExam: ExamPaper = {
          ...resData.data,
          sourceDocName: sourceFileName || undefined,
          toolType: 'exam',
        };
        setExam(generatedExam);
        await consumeCredits('EXAM', `Generated Exam: ${topic}`);
      } else {
        throw new Error(resData.error || 'Server returned invalid exam format.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!exam) return;
    saveResourceToStorage(exam);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!exam) return;
    const text = `# ${exam.institutionHeader}\n## ${exam.title}\nSubject: ${exam.subject} | Grade: ${exam.gradeLevel}\nDuration: ${exam.durationMinutes} mins | Total Marks: ${exam.totalMarks}\n\n### INSTRUCTIONS\n${exam.generalInstructions.map(i => `- ${i}`).join('\n')}\n\n` +
      exam.sections.map(sec => 
        `### ${sec.title} (${sec.totalMarks} Marks)\n${sec.instructions}\n\n` +
        sec.questions.map(q => 
          `Q${q.questionNumber}. [${q.marks} Marks] ${q.prompt}\n` +
          (q.options ? q.options.join('\n') : '') +
          (showMarkingGuide && q.correctAnswer ? `\n> Answer Key: ${q.correctAnswer}\n> Guidance: ${q.markingGuidance || ''}` : '')
        ).join('\n\n')
      ).join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header & Navigation */}
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
                GENERATOR 01 • EXAM & TEST MAKER
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
              Examination Paper Builder
            </h1>
          </div>
        </div>

        {exam && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowMarkingGuide(!showMarkingGuide)}
              className={`px-4 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                showMarkingGuide
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {showMarkingGuide ? 'Hide Marking Rubric' : 'Show Marking Rubric'}
            </button>
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-200 font-mono text-xs font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handlePrint}
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
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-7 shadow-xs space-y-5">
            <h2 className="font-display font-black text-lg uppercase tracking-tight text-[#161616] flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#E63956]" />
              <span>Exam Parameters</span>
            </h2>

            {/* Subject Dropdown */}
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

            {/* Topic Input */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                Central Exam Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Chemical Bonding, African Independence Movements"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-sans text-sm text-stone-900 focus:outline-none focus:border-[#E63956]"
              />
            </div>

            {/* Grade Level */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                Target Grade Level
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-800 focus:outline-none focus:border-[#E63956]"
              >
                {GRADE_LEVELS.map((gl) => (
                  <option key={gl} value={gl}>
                    {gl}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty & Marks Grid */}
            <div className="grid grid-cols-2 gap-3">
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

              <div className="space-y-1.5">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                  Total Marks
                </label>
                <input
                  type="number"
                  min={10}
                  max={200}
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value) || 50)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-900 focus:outline-none focus:border-[#E63956]"
                />
              </div>
            </div>

            {/* Duration & Questions Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                  Duration (Mins)
                </label>
                <input
                  type="number"
                  min={15}
                  max={240}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value) || 60)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-900 focus:outline-none focus:border-[#E63956]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                  Question Count
                </label>
                <input
                  type="number"
                  min={3}
                  max={30}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value) || 10)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-900 focus:outline-none focus:border-[#E63956]"
                />
              </div>
            </div>

            {/* Optional Source Document */}
            <div className="space-y-1.5 pt-1 border-t border-stone-100">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700 block">
                Attach Reference Document (Optional)
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

            {/* Error Message */}
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl font-mono text-xs text-rose-700">
                {error}
              </div>
            )}

            {/* Generate Action Button */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] hover:opacity-95 text-white font-display text-sm font-black uppercase tracking-wider shadow-[0_6px_20px_rgba(230,57,86,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing Exam Paper...' : 'Generate Exam Paper'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Paper Output */}
        <div className="lg:col-span-7">
          {exam ? (
            <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
              {/* Exam Header */}
              <div className="border-b-2 border-stone-800 pb-5 text-center space-y-2">
                <div className="font-mono text-xs font-black uppercase tracking-widest text-stone-500">
                  {exam.institutionHeader || 'PROUDLY AFRIKAN EXAMINATION BOARD'}
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
                  {exam.title}
                </h2>
                <div className="flex items-center justify-center flex-wrap gap-4 font-mono text-xs font-bold text-stone-700 pt-2">
                  <span>SUBJECT: {exam.subject}</span>
                  <span>•</span>
                  <span>GRADE: {exam.gradeLevel}</span>
                  <span>•</span>
                  <span>TIME: {exam.durationMinutes} MINS</span>
                  <span>•</span>
                  <span>TOTAL MARKS: {exam.totalMarks}</span>
                </div>
              </div>

              {/* Instructions Box */}
              {exam.generalInstructions && exam.generalInstructions.length > 0 && (
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                  <div className="font-mono text-xs font-black uppercase tracking-wider text-stone-800">
                    GENERAL INSTRUCTIONS TO CANDIDATES:
                  </div>
                  <ul className="list-disc list-inside space-y-1 font-mono text-xs text-stone-700">
                    {exam.generalInstructions.map((inst, idx) => (
                      <li key={idx}>{inst}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sections & Questions */}
              <div className="space-y-8">
                {exam.sections.map((sec, secIdx) => (
                  <div key={sec.id || secIdx} className="space-y-5">
                    <div className="border-b border-stone-200 pb-2 flex items-center justify-between">
                      <h3 className="font-display font-black text-lg uppercase tracking-tight text-[#161616]">
                        {sec.title}
                      </h3>
                      <span className="font-mono text-xs font-bold text-[#E63956]">
                        [{sec.totalMarks} MARKS]
                      </span>
                    </div>
                    {sec.instructions && (
                      <p className="font-mono text-xs text-stone-600 italic">
                        {sec.instructions}
                      </p>
                    )}

                    <div className="space-y-6">
                      {sec.questions.map((q) => (
                        <div key={q.id} className="p-4 bg-[#FAF8F5] border border-stone-200 rounded-2xl space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="font-sans text-sm font-semibold text-stone-900 leading-relaxed">
                              <span className="font-display font-black text-[#161616] mr-2">
                                Q{q.questionNumber}.
                              </span>
                              {q.prompt}
                            </div>
                            <span className="font-mono text-xs font-bold text-stone-500 shrink-0">
                              [{q.marks} mks]
                            </span>
                          </div>

                          {q.options && q.options.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-4">
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className="font-mono text-xs text-stone-700 bg-white p-2 rounded-lg border border-stone-200">
                                  {opt}
                                </div>
                              ))}
                            </div>
                          )}

                          {showMarkingGuide && (
                            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 animate-in fade-in-50">
                              <div className="flex items-center gap-1.5 font-mono text-[11px] font-black uppercase text-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>MARKING CRITERIA & ANSWER KEY:</span>
                              </div>
                              {q.correctAnswer && (
                                <div className="font-mono text-xs text-emerald-900 font-bold">
                                  Correct Answer: {q.correctAnswer}
                                </div>
                              )}
                              {q.markingGuidance && (
                                <div className="font-mono text-[11px] text-emerald-700">
                                  Guidance: {q.markingGuidance}
                                </div>
                              )}
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
                <FileCheck className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="font-display font-black text-lg text-[#161616] uppercase">
                  Exam Paper Preview
                </h3>
                <p className="font-sans text-xs text-stone-500 leading-relaxed">
                  Configure your exam parameters on the left and click <strong>Generate Exam Paper</strong> to synthesize a classroom-ready test with questions, sections, and marking guides.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
