import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
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
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface ExamGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: ExamPaper;
}

export const ExamGenerator: React.FC<ExamGeneratorProps> = ({
  onBack,
  onGoHome,
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

  useEffect(() => {
    if (existingResource) {
      setExam(existingResource);
      if (existingResource.subject) setSubject(existingResource.subject);
      if (existingResource.topic) setTopic(existingResource.topic);
      if (existingResource.gradeLevel) setGradeLevel(existingResource.gradeLevel);
      if (existingResource.difficulty) setDifficulty(existingResource.difficulty);
      if (existingResource.durationMinutes) setDurationMinutes(existingResource.durationMinutes);
      if (existingResource.totalMarks) setTotalMarks(existingResource.totalMarks);
      if (existingResource.institutionHeader) setInstitutionHeader(existingResource.institutionHeader);
      if (existingResource.sourceDocName) setSourceFileName(existingResource.sourceDocName);
    }
  }, [existingResource]);

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
        saveResourceToStorage(generatedExam);
        if (onSaved) onSaved();
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
    let fullText = `${exam.institutionHeader || ''}\n`;
    fullText += `${exam.title.toUpperCase()}\n`;
    fullText += `Subject: ${exam.subject} | Grade: ${exam.gradeLevel} | Duration: ${exam.durationMinutes} mins | Total: ${exam.totalMarks} Marks\n\n`;
    const instructions = exam.generalInstructions || (exam as any).instructions;
    if (instructions && instructions.length > 0) {
      fullText += `INSTRUCTIONS:\n${instructions.map((ins: string, i: number) => `${i + 1}. ${ins}`).join('\n')}\n\n`;
    }
    exam.sections.forEach((sec, secIdx) => {
      const label = (sec as any).sectionLabel || String.fromCharCode(65 + secIdx);
      const title = sec.title || (sec as any).sectionTitle || `SECTION ${label}`;
      fullText += `=== SECTION ${label}: ${title.toUpperCase()} (${sec.totalMarks} Marks) ===\n`;
      if (sec.instructions) fullText += `${sec.instructions}\n`;
      sec.questions.forEach((q, qIdx) => {
        const qNum = q.questionNumber || (q as any).number || qIdx + 1;
        const qPrompt = q.prompt || (q as any).text || '';
        const bloom = (q as any).bloomTaxonomyLevel ? ` - (${(q as any).bloomTaxonomyLevel})` : '';
        fullText += `\nQuestion ${qNum} [${q.marks} Marks]${bloom}\n`;
        fullText += `${qPrompt}\n`;
        if (q.options && q.options.length > 0) {
          fullText += `${q.options.join('\n')}\n`;
        }
        if (showMarkingGuide) {
          const answer = q.correctAnswer || (q as any).correctAnswerOrRubric;
          if (answer) fullText += `\n>> Marking Rubric / Answer Key:\n${answer}\n`;
          if (q.markingGuidance) fullText += `Guidance: ${q.markingGuidance}\n`;
        }
      });
      fullText += '\n';
    });

    navigator.clipboard.writeText(fullText);
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
        <div className="flex items-center gap-4">
          <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E63956]"></span>
              <span className="font-mono text-base font-bold uppercase tracking-wider text-[#E63956]">
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
              className={`px-4 py-2 rounded-full font-mono text-base font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                showMarkingGuide
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {showMarkingGuide ? 'Hide Marking Rubric' : 'Show Marking Rubric'}
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-200 font-mono text-base font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handlePrint}
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
            <span className="font-mono text-base text-stone-500">Exam Parameters & Specifications</span>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-8 shadow-xs space-y-6">
            {/* Row 1: Subject & Central Topic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subject Dropdown */}
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

              {/* Topic Input */}
              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700">
                  Central Exam Topic *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Chemical Bonding, African Independence Movements"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-sans text-base text-stone-900 focus:outline-none focus:border-[#E63956]"
                />
              </div>
            </div>

            {/* Row 2: Target Grade Level & Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700">
                  Target Grade Level
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

            {/* Row 3: Total Marks, Duration & Questions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700">
                  Total Marks
                </label>
                <input
                  type="number"
                  min={10}
                  max={200}
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value) || 50)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-base text-stone-900 focus:outline-none focus:border-[#E63956]"
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700">
                  Duration (Mins)
                </label>
                <input
                  type="number"
                  min={15}
                  max={240}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value) || 60)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-base text-stone-900 focus:outline-none focus:border-[#E63956]"
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700">
                  Question Count
                </label>
                <input
                  type="number"
                  min={3}
                  max={30}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value) || 10)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-base text-stone-900 focus:outline-none focus:border-[#E63956]"
                />
              </div>
            </div>

            {/* Optional Source Document */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700 block">
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
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl font-mono text-base text-rose-700">
                {error}
              </div>
            )}

            {/* Generate Action Button */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] hover:opacity-95 text-white font-display text-base font-black uppercase tracking-wider shadow-[0_6px_20px_rgba(230,57,86,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isGenerating ? 'Synthesizing Exam Paper...' : 'Generate Exam Paper'}</span>
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
            {exam && (
              <span className="font-mono text-base text-emerald-700 font-bold">
                Exam Paper Ready
              </span>
            )}
          </div>

          {exam ? (
            <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
              {/* Exam Header */}
              <div className="border-b-2 border-stone-800 pb-5 text-center space-y-2">
                <div className="font-mono text-sm font-black uppercase tracking-widest text-stone-500">
                  {exam.institutionHeader || 'PROUDLY AFRIKAN EXAMINATION BOARD'}
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
                  {exam.title}
                </h2>
                <div className="flex items-center justify-center flex-wrap gap-4 font-mono text-sm font-bold text-stone-700 pt-2">
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
              {((exam.generalInstructions && exam.generalInstructions.length > 0) || ((exam as any).instructions && (exam as any).instructions.length > 0)) && (
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2">
                  <h3 className="font-mono text-sm font-black uppercase tracking-wider text-stone-900">
                    INSTRUCTIONS TO CANDIDATES:
                  </h3>
                  <ul className="list-decimal list-inside space-y-1 font-sans text-sm text-stone-700">
                    {(exam.generalInstructions || (exam as any).instructions).map((ins: string, i: number) => (
                      <li key={i}>{ins}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sections & Questions */}
              <div className="space-y-8">
                {exam.sections.map((sec, secIdx) => {
                  const label = (sec as any).sectionLabel || String.fromCharCode(65 + secIdx);
                  const title = sec.title || (sec as any).sectionTitle || `SECTION ${label}`;
                  return (
                    <div key={secIdx} className="space-y-4 pt-4 border-t border-stone-200 first:border-t-0 first:pt-0">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-300">
                        <div>
                          <h4 className="font-display font-black text-lg text-[#161616] uppercase">
                            SECTION {label}: {title}
                          </h4>
                          {sec.instructions && (
                            <p className="font-mono text-xs text-stone-500 italic mt-0.5">
                              {sec.instructions}
                            </p>
                          )}
                        </div>
                        <span className="font-mono text-xs font-bold uppercase tracking-wider px-3 py-1 bg-stone-100 rounded-full text-stone-700">
                          [{sec.totalMarks} Marks]
                        </span>
                      </div>

                      <div className="space-y-6">
                        {sec.questions.map((q, qIdx) => {
                          const qNum = q.questionNumber || (q as any).number || qIdx + 1;
                          const qPrompt = q.prompt || (q as any).text || '';
                          const bloom = (q as any).bloomTaxonomyLevel;
                          const rubricAnswer = q.correctAnswer || (q as any).correctAnswerOrRubric;

                          return (
                            <div
                              key={qIdx}
                              className="bg-stone-50/70 border border-stone-200 rounded-2xl p-5 space-y-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <span className="font-display font-black text-base text-[#161616]">
                                  QUESTION {qNum}
                                </span>
                                <div className="flex items-center gap-2">
                                  {bloom && (
                                    <span className="font-mono text-[11px] font-bold text-stone-500 uppercase px-2 py-0.5 bg-stone-200 rounded-md">
                                      {bloom}
                                    </span>
                                  )}
                                  <span className="font-mono text-xs font-bold text-[#E63956] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                                    [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                                  </span>
                                </div>
                              </div>

                              <div className="font-sans text-base text-stone-800 leading-relaxed whitespace-pre-wrap">
                                {qPrompt}
                              </div>

                              {q.options && q.options.length > 0 && (
                                <div className="space-y-1.5 pt-2">
                                  {q.options.map((opt, oIdx) => (
                                    <div
                                      key={oIdx}
                                      className="font-sans text-sm text-stone-700 bg-white border border-stone-200 rounded-xl px-4 py-2.5"
                                    >
                                      {opt}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Marking Rubric or Answer Key (Toggleable) */}
                              {showMarkingGuide && (
                                <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Marking Rubric / Answer Key:</span>
                                  </div>
                                  {rubricAnswer && (
                                    <div className="font-sans text-sm text-emerald-900 whitespace-pre-wrap">
                                      {rubricAnswer}
                                    </div>
                                  )}
                                  {q.markingGuidance && (
                                    <div className="font-mono text-xs text-emerald-700 pt-1 border-t border-emerald-200">
                                      Guidance: {q.markingGuidance}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[350px]">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center">
                <FileCheck className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="font-display font-black text-xl text-[#161616] uppercase">
                  Exam Paper Preview
                </h3>
                <p className="font-sans text-base text-stone-500 leading-relaxed">
                  Configure your exam parameters above and click <strong>Generate Exam Paper</strong> to synthesize a classroom-ready test with questions, sections, and marking guides.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
