import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  GraduationCap,
  Clock,
  Award,
  Layers,
  HelpCircle,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { ExamPaper, ExamQuestion, ExamSection } from '../../types';
import { SUBJECT_CATEGORIES, GRADE_LEVELS, DIFFICULTY_LEVELS, EXAM_PAGE_OPTIONS } from '../../data/subjects';
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
  const { consumeCredits, openAuthModal, user } = useAuthCredit();

  // Form State
  const [subject, setSubject] = useState<string>(existingResource?.subject || 'History & Geography');
  const [topic, setTopic] = useState<string>(existingResource?.topic || 'The Kingdom of Mali & Mansa Musa');
  const [gradeLevel, setGradeLevel] = useState<string>(existingResource?.gradeLevel || 'Senior Secondary / High School (Grades 9-12)');
  const [difficulty, setDifficulty] = useState<string>(existingResource?.difficulty || 'Intermediate');
  const [pagesCount, setPagesCount] = useState<number>(existingResource?.pagesCount || 2);
  const [durationMinutes, setDurationMinutes] = useState<number>(existingResource?.durationMinutes || 60);
  const [totalMarks, setTotalMarks] = useState<number>(existingResource?.totalMarks || 50);
  const [questionCount, setQuestionCount] = useState<number>(existingResource?.sections?.reduce((acc, s) => acc + s.questions.length, 0) || 8);
  const [institutionHeader, setInstitutionHeader] = useState<string>(existingResource?.institutionHeader || 'Proudly Afrikan Examination Board');
  const [specialInstructions, setSpecialInstructions] = useState<string>(existingResource?.specialInstructions || '');
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceMaterial || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.sourceDocName || '');

  // UI & Action States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [exam, setExam] = useState<ExamPaper | null>(existingResource || null);
  const [showMarkingKey, setShowMarkingKey] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategoryObj = SUBJECT_CATEGORIES.find(c => c.name === subject) || SUBJECT_CATEGORIES[0];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please provide an exam topic or concept.');
      return;
    }

    const creditCheck = await consumeCredits('EXAM', `Generated Exam: ${topic.slice(0, 30)}`);
    if (!creditCheck.success) {
      if (!user) {
        openAuthModal();
      } else {
        setError(creditCheck.error || 'Insufficient credits. Please upgrade or refill credits.');
      }
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
          pagesCount,
          durationMinutes,
          totalMarks,
          questionCount,
          institutionHeader,
          instructions: specialInstructions,
          sourceMaterial,
          sourceDocName: sourceFileName,
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        const generatedExam: ExamPaper = {
          ...json.data,
          toolType: 'exam',
          pagesCount: pagesCount || 2,
          institutionHeader: institutionHeader || 'Proudly Afrikan Examination Board',
          sourceDocName: sourceFileName,
        };
        setExam(generatedExam);
        saveResourceToStorage(generatedExam);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        throw new Error(json.error || 'Failed to generate examination paper.');
      }
    } catch (err: any) {
      console.error('Exam Generation Error:', err);
      setError(err.message || 'An error occurred while building the exam.');
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
    let fullText = `${exam.institutionHeader.toUpperCase()}\n`;
    fullText += `${exam.title.toUpperCase()}\n`;
    fullText += `Subject: ${exam.subject} | Grade: ${exam.gradeLevel} | Time: ${exam.durationMinutes} Mins | Total Marks: ${exam.totalMarks} | Pages: ${exam.pagesCount}\n\n`;
    fullText += `GENERAL INSTRUCTIONS:\n${exam.generalInstructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}\n\n`;

    exam.sections.forEach((sec) => {
      fullText += `----------------------------------------\n`;
      fullText += `${sec.title.toUpperCase()} [${sec.marks || sec.totalMarks} MARKS]\n`;
      fullText += `${sec.instructions}\n\n`;

      sec.questions.forEach((q) => {
        fullText += `Question ${q.questionNumber} [${q.marks} Mark${q.marks > 1 ? 's' : ''}]:\n`;
        fullText += `${q.prompt}\n`;
        if (q.options && q.options.length > 0) {
          q.options.forEach(opt => fullText += `   ${opt}\n`);
        }
        fullText += `\n`;
      });
    });

    if (showMarkingKey) {
      fullText += `========================================\n`;
      fullText += `OFFICIAL MARKING SCHEME & ANSWERS\n`;
      fullText += `========================================\n\n`;
      exam.sections.forEach((sec) => {
        fullText += `[${sec.title}]\n`;
        sec.questions.forEach((q) => {
          fullText += `Q${q.questionNumber}: Correct Answer / Model Solution: ${q.correctAnswer || 'See guidance'}\n`;
          if (q.markingGuidance) fullText += `   Marking Guidance: ${q.markingGuidance}\n`;
          fullText += `\n`;
        });
      });
      if (exam.overallMarkingNotes) {
        fullText += `Marking Notes: ${exam.overallMarkingNotes}\n`;
      }
    }

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white hover:bg-stone-50 border border-[#E5E0D8] rounded-full text-xs font-mono font-bold uppercase tracking-wider text-[#161616] flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Build
        </button>

        <div className="px-4 py-1.5 bg-[#161616] text-white rounded-full text-[11px] font-mono font-bold uppercase tracking-widest shadow-xs">
          Tool 01: Exam Generator
        </div>
      </div>

      {/* Main Grid: Form Left (38%) + Paper Right (62%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Configuration */}
        <div className="lg:col-span-5 bg-white border border-[#E5E0D8] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          {/* Card Title & Icon */}
          <div className="flex items-center gap-3.5 pb-2">
            <div className="w-11 h-11 rounded-2xl bg-[#161616] text-[#D92B8A] flex items-center justify-center shadow-xs shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl tracking-tight text-[#161616] uppercase">
                Build An Exam
              </h2>
              <p className="font-mono text-xs text-stone-600">
                Structured examination with answers
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Subject Category */}
            <div>
              <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                Subject Category *
              </label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  const found = SUBJECT_CATEGORIES.find(c => c.name === e.target.value);
                  if (found && found.subtopics[0]) {
                    setTopic(found.subtopics[0]);
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A] focus:bg-white"
              >
                {SUBJECT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Topic */}
            <div>
              <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                Exam Topic or Specific Concept *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Imhotep Story - A Legacy of Kemet"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A] focus:bg-white"
                required
              />
              {/* Quick Topic Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedCategoryObj.subtopics.slice(0, 3).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setTopic(st)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all ${
                      topic === st
                        ? 'bg-[#161616] text-white border-[#161616]'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-200'
                    }`}
                  >
                    {st.length > 25 ? `${st.slice(0, 25)}...` : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Grade Level & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                  Grade Level
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                >
                  {GRADE_LEVELS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                >
                  {DIFFICULTY_LEVELS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4 Metric Inputs: Pages (1-10), Mins, Marks, Questions */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div>
                <label className="block text-[11px] font-mono font-bold tracking-wider text-[#161616] uppercase mb-1 text-center">
                  Pages *
                </label>
                <select
                  value={pagesCount}
                  onChange={(e) => setPagesCount(Number(e.target.value))}
                  className="w-full py-2 px-1 text-center bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                >
                  {EXAM_PAGE_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold tracking-wider text-[#161616] uppercase mb-1 text-center">
                  Mins *
                </label>
                <input
                  type="number"
                  min={15}
                  max={240}
                  step={5}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full py-2 px-1 text-center bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold tracking-wider text-[#161616] uppercase mb-1 text-center">
                  Marks *
                </label>
                <input
                  type="number"
                  min={10}
                  max={200}
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                  className="w-full py-2 px-1 text-center bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold tracking-wider text-[#161616] uppercase mb-1 text-center">
                  Questions *
                </label>
                <input
                  type="number"
                  min={2}
                  max={50}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full py-2 px-1 text-center bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                />
              </div>
            </div>

            {/* Examination Header / Board */}
            <div>
              <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                Examination Header / Board
              </label>
              <input
                type="text"
                value={institutionHeader}
                onChange={(e) => setInstitutionHeader(e.target.value)}
                placeholder="e.g. Proudly Afrikan Examination Board"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
              />
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                Special Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Include 1 scenario question, formula sheet required..."
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A] resize-none"
              />
            </div>

            {/* Source Material Upload */}
            <SourceMaterialUpload
              label="Add Source Material"
              optionalTag="OPTIONAL"
              currentFileName={sourceFileName}
              onTextExtracted={(text, name) => {
                setSourceMaterial(text);
                setSourceFileName(name);
              }}
              onClear={() => {
                setSourceMaterial('');
                setSourceFileName('');
              }}
            />

            {error && (
              <p className="text-xs text-red-600 font-sans p-2 rounded-xl bg-red-50 border border-red-200">
                {error}
              </p>
            )}

            {/* Generate Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#D92B8A] to-[#E05A2B] hover:from-[#c22079] hover:to-[#cb4e22] text-white font-display font-black text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Exam Paper...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Build Examination ↗</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Generated Examination Paper */}
        <div className="lg:col-span-7 space-y-4">
          {exam ? (
            <div className="space-y-4">
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1 print:hidden">
                <button
                  type="button"
                  onClick={() => setShowMarkingKey(!showMarkingKey)}
                  className="px-4 py-2 rounded-full bg-[#161616] hover:bg-stone-800 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  {showMarkingKey ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-[#D92B8A]" />
                      Hide Marking Key
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-[#D92B8A]" />
                      Show Marking Key
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-[#161616] font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3.5 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-[#161616] font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-[#D92B8A] to-[#E05A2B] hover:from-[#c22079] hover:to-[#cb4e22] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    {saved ? 'Saved to Builds' : 'Save to My Builds ↗'}
                  </button>
                </div>
              </div>

              {/* Printable Official Exam Paper Card */}
              <div 
                id="printable-exam-paper"
                className="bg-white border border-[#E5E0D8] rounded-3xl p-7 sm:p-10 shadow-sm space-y-7 print:border-none print:shadow-none print:p-0"
              >
                {/* Header Board & Title */}
                <div className="text-center space-y-2.5 pb-2">
                  <p className="text-xs font-mono font-black uppercase tracking-[0.2em] text-[#D92B8A]">
                    {exam.institutionHeader || 'PROUDLY AFRIKAN EXAMINATION BOARD'}
                  </p>
                  <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616] leading-tight">
                    {exam.title.replace(/^Comprehensive Examination:\s*/i, 'COMPREHENSIVE EXAMINATION: ')}
                  </h1>

                  {/* Metadata Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <span className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-sans font-bold text-stone-800 shadow-2xs">
                      Subject: {exam.subject}
                    </span>
                    <span className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-sans font-bold text-stone-800 shadow-2xs">
                      Grade: {exam.gradeLevel}
                    </span>
                    <span className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-sans font-bold text-stone-800 shadow-2xs">
                      Time: {exam.durationMinutes} Mins
                    </span>
                    <span className="px-3 py-1 bg-pink-50 border border-pink-200 text-[#D92B8A] rounded-full text-xs font-mono font-bold shadow-2xs">
                      Total Marks: {exam.totalMarks}
                    </span>
                    <span className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-mono font-bold text-stone-800 shadow-2xs">
                      Pages: {exam.pagesCount || pagesCount}
                    </span>
                  </div>
                </div>

                {/* Candidate Info Box */}
                <div className="bg-[#FAF7F0] border border-[#E5E0D8] rounded-2xl p-4 sm:p-5 space-y-3 text-xs font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-800 font-bold">
                    <div>
                      CANDIDATE NAME: <span className="font-normal text-stone-400">_________________________________</span>
                    </div>
                    <div>
                      STUDENT ID / INDEX NO: <span className="font-normal text-stone-400">_____________________</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-stone-200 text-stone-700">
                    <strong className="text-[#161616]">GENERAL INSTRUCTIONS:</strong> Answer all questions in the spaces provided. Write clearly and show all intermediate steps where applicable.
                    {exam.generalInstructions && exam.generalInstructions.length > 0 && (
                      <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-stone-600 font-normal">
                        {exam.generalInstructions.map((inst, i) => (
                          <li key={i}>{inst}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Examination Sections */}
                <div className="space-y-8">
                  {exam.sections.map((section, sIdx) => (
                    <div key={section.id || sIdx} className="space-y-4">
                      {/* Section Header Card */}
                      <div className="bg-[#FAF7F0] border border-[#E5E0D8] rounded-2xl p-4 flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-display font-black text-sm uppercase tracking-wide text-[#161616]">
                            {section.title}
                          </h3>
                          <p className="font-sans text-xs text-stone-600 mt-0.5">
                            {section.instructions}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-white border border-stone-300 rounded-xl text-xs font-mono font-bold text-[#161616] shrink-0 shadow-2xs">
                          [{section.marks || section.totalMarks || 20} Marks]
                        </span>
                      </div>

                      {/* Questions List */}
                      <div className="space-y-4 pl-0 sm:pl-1">
                        {section.questions.map((q, qIdx) => (
                          <div 
                            key={q.id || qIdx}
                            className="bg-[#FAF7F0]/60 border border-[#E8E2D8] rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs"
                          >
                            {/* Question Header: Dark Number Badge + Prompt */}
                            <div className="flex items-start gap-3.5">
                              <div className="w-8 h-8 rounded-full bg-[#161616] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                                {q.questionNumber || qIdx + 1}
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="font-sans font-semibold text-sm sm:text-base text-[#161616] leading-relaxed">
                                  {q.prompt}
                                </p>
                                <span className="inline-block text-[11px] font-mono text-stone-500 font-bold">
                                  [{q.marks} Mark{q.marks > 1 ? 's' : ''}]
                                </span>
                              </div>
                            </div>

                            {/* Multiple Choice Options (Formatted as in Format.jpg) */}
                            {q.options && q.options.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                {q.options.map((optionStr, oIdx) => {
                                  const letter = String.fromCharCode(65 + oIdx);
                                  const cleanText = optionStr.replace(/^[A-D]\)\s*/i, '');
                                  return (
                                    <div
                                      key={oIdx}
                                      className="bg-white border border-[#E5E0D8] rounded-2xl py-3 px-4 shadow-xs text-xs font-mono text-stone-900 flex items-start gap-2 hover:border-stone-400 transition-colors"
                                    >
                                      <span className="font-bold text-[#161616] shrink-0">
                                        {letter})
                                      </span>
                                      <span className="leading-snug">
                                        {cleanText}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Structured / Problem Solving Line Workspace for Exam */}
                            {(!q.options || q.options.length === 0) && (
                              <div className="pt-2">
                                <div className="border-b border-dashed border-stone-300 py-3 text-stone-300 text-xs font-mono select-none">
                                  Answer line: ____________________________________________________________________________________
                                </div>
                                <div className="border-b border-dashed border-stone-300 py-3 text-stone-300 text-xs font-mono select-none">
                                  _________________________________________________________________________________________________
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Official Marking Key / Answers Section PLACED AT THE END OF THE EXAM */}
                {showMarkingKey && (
                  <div className="mt-10 pt-8 border-t-2 border-dashed border-stone-300 space-y-6">
                    <div className="bg-[#161616] text-white rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#D92B8A] text-white flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-display font-black text-sm uppercase tracking-wider">
                            Official Marking Scheme & Model Solutions
                          </h3>
                          <p className="font-mono text-xs text-stone-300">
                            Examiner reference & student self-assessment key
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono text-pink-300">
                        CONFIDENTIAL KEY
                      </span>
                    </div>

                    <div className="space-y-4">
                      {exam.sections.map((section, sIdx) => (
                        <div key={sIdx} className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3">
                          <h4 className="font-mono font-bold text-xs text-[#D92B8A] uppercase tracking-wider">
                            {section.title} — Answers
                          </h4>
                          <div className="space-y-3 divide-y divide-stone-200">
                            {section.questions.map((q, qIdx) => (
                              <div key={qIdx} className="pt-2.5 first:pt-0 space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-bold text-[#161616] font-sans">
                                    Q{q.questionNumber || qIdx + 1}: {q.prompt.length > 80 ? `${q.prompt.slice(0, 80)}...` : q.prompt}
                                  </p>
                                  <span className="text-[11px] font-mono text-[#D92B8A] font-bold shrink-0">
                                    [{q.marks}M]
                                  </span>
                                </div>
                                <div className="bg-white border border-stone-200 rounded-xl p-3 text-xs font-mono text-stone-800 space-y-1">
                                  <p className="text-emerald-700 font-bold">
                                    ✓ Model Answer: <span className="font-normal text-stone-900">{q.correctAnswer || 'Detailed conceptual answer.'}</span>
                                  </p>
                                  {q.markingGuidance && (
                                    <p className="text-stone-600 text-[11px]">
                                      Guidance: {q.markingGuidance}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {exam.overallMarkingNotes && (
                        <div className="p-4 bg-pink-50/50 border border-pink-200 rounded-2xl text-xs font-mono text-stone-700">
                          <strong className="text-[#D92B8A]">Grading Moderation Notes:</strong> {exam.overallMarkingNotes}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty State Placeholder */
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[500px]">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="font-display font-black text-lg text-[#161616] uppercase">
                  Exam Paper Preview
                </h3>
                <p className="font-sans text-xs text-stone-500 leading-relaxed">
                  Configure your exam parameters on the left (subject, pages, difficulty, instructions) and click <strong>Build Examination</strong> to synthesize an editorial-grade exam with full question layout and answers.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
