import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  Download,
  CheckCircle2,
  HelpCircle,
  Clock,
  Award,
  BookOpen,
  ChevronDown
} from 'lucide-react';
import { ExamPaper, SavedResource } from '../../types';
import { generateExamApi } from '../../services/buildService';
import { saveResourceToStorage } from '../../utils/storage';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface ExamGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  initialResource?: SavedResource | null;
}

export const ExamGenerator: React.FC<ExamGeneratorProps> = ({
  onBack,
  onGoHome,
  initialResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [topic, setTopic] = useState<string>(initialResource?.topic || initialResource?.title || '');
  const [subject, setSubject] = useState<string>(initialResource?.subject || 'History & Geography');
  const [gradeLevel, setGradeLevel] = useState<string>(initialResource?.gradeLevel || 'Secondary / High School (Grades 9-12)');
  const [difficulty, setDifficulty] = useState<string>('Intermediate');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [totalMarks, setTotalMarks] = useState<number>(50);
  const [instructions, setInstructions] = useState<string>('');
  const [sourceMaterial, setSourceMaterial] = useState<string>(initialResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(initialResource?.documentName || '');

  // Generation & Active Result State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<ExamPaper | null>(initialResource?.data || null);
  const [showMarkingScheme, setShowMarkingScheme] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialResource?.data) {
      setResult(initialResource.data);
    }
  }, [initialResource]);

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please enter an exam topic or attach curriculum materials.');
      return;
    }

    if (!canAfford('EXAM_WORKSHEET')) {
      setError('Insufficient credits for Exam generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const data = await generateExamApi({
        subject,
        topic: topic.trim() || 'Comprehensive Curriculum Examination',
        gradeLevel,
        difficulty,
        questionCount,
        durationMinutes,
        totalMarks,
        instructions,
        sourceMaterial: sourceMaterial.trim() || undefined,
      });

      setResult(data);
      await consumeCredits('EXAM_WORKSHEET', `Generated Exam: ${data.title}`);

      // Smooth scroll to generated exam
      setTimeout(() => {
        const el = document.getElementById('generated-exam-result');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Exam generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    saveResourceToStorage({
      id: result.id || `exam-${Date.now()}`,
      toolType: 'exam',
      title: result.title,
      subject: result.subject || subject,
      topic: result.topic || topic,
      gradeLevel: result.gradeLevel || gradeLevel,
      createdAt: new Date().toISOString(),
      data: result,
      sourceSnippet: sourceMaterial ? sourceMaterial.slice(0, 300) : undefined,
      documentName: sourceFileName || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!result) return;
    let fullText = `${result.institutionHeader || 'PROUDLY AFRIKAN EXAMINATION'}\n`;
    fullText += `${result.title}\nSubject: ${result.subject} | Grade: ${result.gradeLevel}\nTime Allowed: ${result.durationMinutes} Minutes | Max Marks: ${result.totalMarks}\n\n`;
    fullText += `INSTRUCTIONS:\n${(result.instructions || []).map((ins, i) => `${i + 1}. ${ins}`).join('\n')}\n\n`;

    (result.sections || []).forEach((sec) => {
      fullText += `=== ${sec.sectionTitle} (${sec.marks} Marks) ===\n${sec.instructions}\n\n`;
      (sec.questions || []).forEach((q) => {
        fullText += `Q${q.questionNumber}. [${q.marks} Marks] ${q.questionText}\n`;
        if (q.options && q.options.length > 0) {
          q.options.forEach((opt, oIdx) => {
            fullText += `   ${String.fromCharCode(65 + oIdx)}. ${opt}\n`;
          });
        }
        fullText += '\n';
      });
    });

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80">
          <div className="flex items-center gap-3">
            <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
            <div>
              <span className="font-mono text-base font-bold text-[#E63956] uppercase tracking-wider block">
                BUILD TOOL 02 • ASSESSMENT & TESTING
              </span>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
                EXAM & QUIZ GENERATOR
              </h1>
            </div>
          </div>

          {result && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowMarkingScheme(!showMarkingScheme)}
                className={`px-4 py-2.5 rounded-xl border font-mono text-base font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showMarkingScheme 
                    ? 'bg-emerald-600 text-white border-emerald-600' 
                    : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{showMarkingScheme ? 'Show Student Exam' : 'Teacher Marking Scheme'}</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-base font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-base font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-[#E63956] hover:bg-[#D32F4C] text-white font-mono text-base font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Bookmark className="w-4 h-4" />
                <span>{saved ? 'Saved' : 'Save Exam'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Form: Exam Parameters */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 sm:p-7 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <Sparkles className="w-5 h-5 text-[#E63956]" />
                <h2 className="font-display font-black text-lg uppercase text-[#161616] tracking-wider">
                  Exam Blueprint
                </h2>
              </div>

              <div>
                <label className="block font-mono text-base font-bold text-stone-800 uppercase mb-2">
                  Exam Topic / Subject Focus *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. West African Trade Networks & Songhai Empire"
                  className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:border-[#E63956] focus:ring-1 focus:ring-[#E63956] bg-stone-50 text-base font-medium outline-hidden"
                />
              </div>

              <div>
                <label className="block font-mono text-base font-bold text-stone-800 uppercase mb-2">
                  Curriculum Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-base font-medium outline-hidden"
                >
                  <option value="History & Geography">History & Geography</option>
                  <option value="Sciences & STEM">Sciences & STEM</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Languages & Literature">Languages & Literature</option>
                  <option value="Civics & Economics">Civics & Economics</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-base font-bold text-stone-800 uppercase mb-2">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-base font-medium outline-hidden"
                  >
                    <option value="Foundational">Foundational</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-base font-bold text-stone-800 uppercase mb-2">
                    Questions
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full px-3 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-base font-medium outline-hidden"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-base font-bold text-stone-800 uppercase mb-2">
                    Time Allowed
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-base font-medium outline-hidden"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes</option>
                    <option value={120}>2 Hours</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-base font-bold text-stone-800 uppercase mb-2">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full px-3 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-base font-medium outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-base font-bold text-stone-800 uppercase mb-2">
                  Optional Source Document (PDF / DOCX)
                </label>
                <SourceMaterialUpload
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
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-base font-mono">
                  {error}
                </div>
              )}

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="w-full py-4 rounded-xl bg-[#E63956] hover:bg-[#D32F4C] disabled:bg-stone-300 text-white font-display font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
              >
                <Sparkles className="w-5 h-5" />
                <span>{isGenerating ? 'EXAM PAPER LOADING…' : 'Generate Exam Paper →'}</span>
              </button>
            </div>
          </div>

          {/* Right Preview / Output */}
          <div className="lg:col-span-8" id="generated-exam-result">
            {isGenerating ? (
              <div className="min-h-[460px] p-12 rounded-[2rem] bg-white border border-stone-200/90 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E63956]/10 text-[#E63956] flex items-center justify-center animate-bounce">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-black text-2xl text-[#161616] uppercase tracking-tight">
                    EXAM PAPER LOADING…
                  </h3>
                  <p className="text-stone-600 text-base font-normal max-w-md">
                    Synthesizing curriculum standards, structuring examination sections, and calibrating mark schemes.
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-6">
                
                {/* Official Exam Sheet Container */}
                <div className="p-8 sm:p-12 rounded-[2rem] bg-white border-2 border-stone-300/80 shadow-[0_15px_40px_rgba(0,0,0,0.06)] space-y-8">
                  
                  {/* Institution Header Banner */}
                  <div className="border-b-2 border-stone-900 pb-6 text-center space-y-2">
                    <span className="font-mono text-base font-black tracking-[0.25em] text-[#E63956] uppercase block">
                      {result.institutionHeader || 'PROUDLY AFRIKAN EXAMINATION BOARD'}
                    </span>
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-stone-900 uppercase tracking-tight">
                      {result.title}
                    </h2>
                    
                    <div className="flex flex-wrap items-center justify-center gap-4 text-base font-mono text-stone-700 pt-2">
                      <span><strong>SUBJECT:</strong> {result.subject}</span>
                      <span>•</span>
                      <span><strong>GRADE:</strong> {result.gradeLevel}</span>
                      <span>•</span>
                      <span><strong>TIME ALLOWED:</strong> {result.durationMinutes} MIN</span>
                      <span>•</span>
                      <span><strong>MAXIMUM MARKS:</strong> {result.totalMarks}</span>
                    </div>

                    {/* Candidate Details Line */}
                    <div className="mt-4 pt-4 border-t border-stone-200 flex flex-col sm:flex-row justify-between text-base font-mono text-stone-600">
                      <span>CANDIDATE NAME: ____________________________</span>
                      <span>INDEX NUMBER: _______________</span>
                    </div>
                  </div>

                  {/* Instructions */}
                  {result.instructions && result.instructions.length > 0 && (
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-base font-mono text-stone-800 space-y-1">
                      <strong className="block text-stone-900 uppercase text-base">Instructions to Candidates:</strong>
                      <ul className="list-disc list-inside space-y-1 pl-1">
                        {result.instructions.map((ins, i) => (
                          <li key={i}>{ins}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sections */}
                  <div className="space-y-8">
                    {(result.sections || []).map((sec, sIdx) => (
                      <div key={sIdx} className="space-y-4">
                        <div className="flex items-center justify-between border-b-2 border-stone-800 pb-2">
                          <h3 className="font-display font-black text-xl text-stone-900 uppercase tracking-wide">
                            {sec.sectionTitle}
                          </h3>
                          <span className="font-mono text-base font-bold text-[#E63956]">
                            [{sec.marks} MARKS]
                          </span>
                        </div>
                        {sec.instructions && (
                          <p className="text-stone-600 text-base italic font-serif">
                            {sec.instructions}
                          </p>
                        )}

                        {/* Questions list */}
                        <div className="space-y-6 pt-2">
                          {(sec.questions || []).map((q) => (
                            <div key={q.questionNumber} className="space-y-2.5">
                              <div className="flex items-start justify-between gap-4">
                                <p className="text-stone-900 text-base sm:text-lg font-medium leading-relaxed">
                                  <strong>Question {q.questionNumber}.</strong> {q.questionText}
                                </p>
                                <span className="font-mono text-base font-bold text-stone-700 shrink-0">
                                  [{q.marks} mks]
                                </span>
                              </div>

                              {/* Multiple Choice Options */}
                              {q.options && q.options.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                                  {q.options.map((opt, oIdx) => (
                                    <div 
                                      key={oIdx}
                                      className="p-3 rounded-xl border border-stone-200 text-base font-mono flex items-center gap-2 bg-stone-50"
                                    >
                                      <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center text-base shrink-0">
                                        {String.fromCharCode(65 + oIdx)}
                                      </span>
                                      <span className="text-stone-800">{opt}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Teacher Marking Scheme overlay when enabled */}
                              {showMarkingScheme && (
                                <div className="mt-3 p-4 rounded-xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 text-base font-mono space-y-1">
                                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>MARKING SCHEME & SOLUTION:</span>
                                  </div>
                                  <p className="text-base text-emerald-900">
                                    <strong>Correct Answer:</strong> {String(q.correctAnswer || 'Answer provided in guide')}
                                  </p>
                                  {q.markingGuide && (
                                    <p className="text-base text-emerald-800">
                                      <strong>Criteria:</strong> {q.markingGuide}
                                    </p>
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

              </div>
            ) : (
              <div className="min-h-[460px] p-12 rounded-[2rem] bg-white border border-dashed border-stone-300 flex flex-col items-center justify-center text-center space-y-4 text-stone-500">
                <BookOpen className="w-12 h-12 text-stone-300" />
                <div className="space-y-1">
                  <h3 className="font-display font-black text-xl text-stone-700 uppercase">
                    No Examination Active
                  </h3>
                  <p className="text-base text-stone-500 max-w-sm">
                    Configure your assessment parameters on the left or upload syllabus notes to generate a full exam paper.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
