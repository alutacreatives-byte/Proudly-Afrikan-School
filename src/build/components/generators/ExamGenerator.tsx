import React, { useState } from 'react';
import {
  FileQuestion,
  Sparkles,
  Printer,
  Copy,
  Bookmark,
  Check,
  ArrowLeft,
  BookOpen,
  Clock,
  Award,
  Download,
  Eye,
  EyeOff,
  CheckCircle2,
  Layers,
  AlertCircle
} from 'lucide-react';
import { ExamResult } from '../../types';
import { generateExam } from '../../services/buildService';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface ExamGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: ExamResult;
}

export const ExamGenerator: React.FC<ExamGeneratorProps> = ({
  onBack,
  onGoHome,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [subject, setSubject] = useState<string>(existingResource?.subject || 'AFRICAN HISTORY');
  const [topic, setTopic] = useState<string>(existingResource?.topic || existingResource?.title || '');
  const [gradeLevel, setGradeLevel] = useState<string>(existingResource?.gradeLevel || 'Senior Secondary / High School (Grades 9-12)');
  const [difficulty, setDifficulty] = useState<string>(existingResource?.difficulty || 'Intermediate');
  const [durationMinutes, setDurationMinutes] = useState<number>(existingResource?.durationMinutes || 60);
  const [totalMarks, setTotalMarks] = useState<number>(existingResource?.totalMarks || 50);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [instructions, setInstructions] = useState<string>('');
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Result & View State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [exam, setExam] = useState<ExamResult | null>(
    existingResource && Array.isArray(existingResource.sections) && existingResource.sections.length > 0
      ? existingResource
      : null
  );
  const [showMarkingScheme, setShowMarkingScheme] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please provide an examination topic or upload source curriculum material.');
      return;
    }

    if (!canAfford('EXAM')) {
      setError('Insufficient credits for Exam Paper generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const result = await generateExam({
        subject,
        topic: topic.trim() || 'Comprehensive Curriculum Assessment',
        gradeLevel,
        difficulty,
        durationMinutes,
        totalMarks,
        questionCount,
        instructions,
        sourceMaterial: sourceMaterial.trim() || undefined,
      });

      setExam(result);
      await consumeCredits('EXAM', `Generated Exam Paper: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Exam generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!exam) return;
    saveResourceToStorage({
      id: exam.id || `exam-${Date.now()}`,
      toolType: 'exam',
      title: exam.title,
      subject: exam.subject || subject,
      topic: exam.topic || topic,
      createdAt: new Date().toISOString(),
      data: exam,
      sourceSnippet: sourceMaterial ? sourceMaterial.slice(0, 300) : undefined,
      documentName: sourceFileName || undefined,
    });
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!exam) return;
    let text = `${exam.institutionHeader || 'PROUDLY AFRIKAN EXAMINATION BOARD'}\n`;
    text += `${exam.title}\nSubject: ${exam.subject} | Grade: ${exam.gradeLevel}\nTime Allowed: ${exam.durationMinutes} Minutes | Total Marks: ${exam.totalMarks}\n\n`;
    text += `GENERAL INSTRUCTIONS:\n`;
    (exam.generalInstructions || []).forEach((inst, i) => {
      text += `${i + 1}. ${inst}\n`;
    });
    text += `\n`;

    (exam.sections || []).forEach((sec) => {
      text += `=========================================\n${sec.title.toUpperCase()} (${sec.totalMarks} MARKS)\n${sec.instructions}\n=========================================\n\n`;
      (sec.questions || []).forEach((q) => {
        text += `Question ${q.questionNumber} [${q.marks} Marks]\n${q.prompt}\n`;
        if (q.options && q.options.length > 0) {
          q.options.forEach((opt) => {
            text += `  ${opt}\n`;
          });
        }
        if (showMarkingScheme) {
          if (q.correctAnswer) text += `  >> Correct Answer: ${q.correctAnswer}\n`;
          if (q.markingGuidance) text += `  >> Marking Guidance: ${q.markingGuidance}\n`;
        }
        text += `\n`;
      });
    });

    if (showMarkingScheme && exam.overallMarkingNotes) {
      text += `\nOVERALL MARKING & MODERATION NOTES:\n${exam.overallMarkingNotes}\n`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 print:py-0 print:px-0">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5 print:hidden">
        <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E05A2B]/10 text-[#E05A2B] font-mono text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>30 Credits / Paper</span>
          </span>
          <span className="font-mono text-xs text-stone-500 uppercase">
            Build • Assessment Suite
          </span>
        </div>
      </div>

      {/* Title block */}
      <div className="space-y-2 print:hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] text-white text-xs font-mono font-bold uppercase">
          <FileQuestion className="w-3.5 h-3.5 text-[#E05A2B]" />
          <span>Examiner Studio</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-stone-900">
          Examination Paper & Marking Scheme Builder
        </h1>
        <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
          Generate complete, structured academic examinations with Section A (Multiple Choice), Section B (Analytical Short Answers & Problem Solving), authentic question weighting, and a comprehensive teacher moderation rubric.
        </p>
      </div>

      {/* Generator Configuration Form (Hidden if printing) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 print:hidden">
        <h2 className="font-display font-black text-lg uppercase tracking-wider text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <Sparkles className="w-5 h-5 text-[#E05A2B]" />
          <span>Configure Examination Specifications</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Subject / Academic Domain *
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value="AFRICAN HISTORY">African History & Heritage</option>
              <option value="PHYSICAL SCIENCES">Physical Sciences & Chemistry</option>
              <option value="LIFE SCIENCES">Life Sciences & Biology</option>
              <option value="MATHEMATICS">Mathematics & Calculus</option>
              <option value="GEOGRAPHY & CLIMATE">Geography & Environmental Systems</option>
              <option value="ECONOMICS & COMMERCE">Economics, Finance & Trade</option>
              <option value="CIVICS & POLITICAL SCIENCE">Civics & Governance</option>
              <option value="LITERATURE & LANGUAGES">African Literature & Rhetoric</option>
              <option value="INFORMATION TECHNOLOGY">Computer Science & Algorithms</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Exam Topic / Focus Unit *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Resistance to Colonial Rule & The Battle of Adwa"
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Grade / Learning Level
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value="Junior Secondary / Middle School (Grades 6-8)">Junior Secondary (Grades 6-8)</option>
              <option value="Senior Secondary / High School (Grades 9-12)">Senior Secondary / High School (Grades 9-12)</option>
              <option value="Matriculation / Grade 12 National Exam Prep">Matriculation / Grade 12 National Prep</option>
              <option value="Undergraduate / Tertiary Level">Undergraduate / Tertiary Level</option>
              <option value="Adult / Professional Certification">Adult & Professional Certification</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Rigor & Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value="Standard Foundation">Standard Foundation (Low to Medium)</option>
              <option value="Intermediate">Intermediate (CAPS / General National Standard)</option>
              <option value="Advanced / Honors">Advanced / Honors (High Cognitive Demand)</option>
              <option value="Olympiad / Distinction">Olympiad & Competitive Distinction</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min={15}
              max={180}
              step={15}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value) || 60)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Total Marks Target
            </label>
            <input
              type="number"
              min={20}
              max={150}
              step={10}
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value) || 50)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            />
          </div>
        </div>

        {/* Source material upload (Optional) */}
        <div className="space-y-2">
          <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
            Source Material, Past Papers, or Curriculum Excerpt (Optional)
          </label>
          <SourceMaterialUpload
            sourceMaterial={sourceMaterial}
            sourceFileName={sourceFileName}
            onTextExtracted={(text, filename) => {
              setSourceMaterial(text);
              if (filename) setSourceFileName(filename);
            }}
            onClear={() => {
              setSourceMaterial('');
              setSourceFileName('');
            }}
          />
        </div>

        {/* Specific instructions */}
        <div className="space-y-1.5">
          <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
            Specific Teacher / Examiner Directives (Optional)
          </label>
          <textarea
            rows={2}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. Include 1 source interpretation question and emphasize ethical reasoning."
            className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
          />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-4 rounded-2xl bg-[#E05A2B] hover:bg-[#c94d22] text-white font-display font-black text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Synthesizing Exam Paper & Marking Memo...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Examination Paper (30 Credits)</span>
            </>
          )}
        </button>
      </div>

      {/* Examination Output Screen */}
      {exam && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm print:hidden">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMarkingScheme(!showMarkingScheme)}
                className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  showMarkingScheme
                    ? 'bg-[#18181B] text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                }`}
              >
                {showMarkingScheme ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showMarkingScheme ? 'Hide Marking Memo' : 'Show Marking Memo'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Paper</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-[#E05A2B] hover:bg-[#c94d22] text-white text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{saved ? 'Saved to My Sets' : 'Save Paper'}</span>
              </button>
            </div>
          </div>

          {/* Authentic Examination Sheet */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-300 shadow-md space-y-8 print:border-none print:shadow-none print:p-0">
            {/* Institution Header */}
            <div className="text-center border-b-2 border-stone-900 pb-6 space-y-2">
              <div className="font-display font-black text-base sm:text-lg uppercase tracking-widest text-stone-800">
                {exam.institutionHeader || 'PROUDLY AFRIKAN EXAMINATION BOARD'}
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-stone-950">
                {exam.title}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 font-mono text-xs font-bold text-stone-600 uppercase">
                <span>SUBJECT: {exam.subject}</span>
                <span>•</span>
                <span>LEVEL: {exam.gradeLevel}</span>
                <span>•</span>
                <span>DIFFICULTY: {exam.difficulty}</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 font-mono text-xs font-black text-stone-900 uppercase pt-2">
                <span className="px-3 py-1 bg-stone-100 rounded-lg">TIME ALLOWED: {exam.durationMinutes} MINUTES</span>
                <span className="px-3 py-1 bg-stone-100 rounded-lg">TOTAL MARKS: {exam.totalMarks} MARKS</span>
              </div>
            </div>

            {/* General Instructions */}
            {exam.generalInstructions && exam.generalInstructions.length > 0 && (
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2">
                <div className="font-display font-black text-xs uppercase tracking-wider text-stone-800">
                  General Instructions to Candidates:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-stone-700 leading-relaxed font-medium">
                  {exam.generalInstructions.map((instruction, idx) => (
                    <li key={idx}>{instruction}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Examination Sections */}
            <div className="space-y-10">
              {(exam.sections || []).map((section, sIdx) => (
                <div key={section.id || sIdx} className="space-y-6">
                  <div className="border-b border-stone-900 pb-2 flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-black text-lg sm:text-xl uppercase text-stone-950">
                        {section.title}
                      </h3>
                      {section.instructions && (
                        <p className="text-xs text-stone-600 italic mt-0.5">
                          {section.instructions}
                        </p>
                      )}
                    </div>
                    <span className="font-mono font-black text-xs px-3 py-1 bg-stone-900 text-white rounded-lg uppercase">
                      [{section.totalMarks} MARKS]
                    </span>
                  </div>

                  {/* Questions List */}
                  <div className="space-y-6">
                    {(section.questions || []).map((q) => (
                      <div key={q.id || q.questionNumber} className="space-y-3 pt-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <span className="font-mono font-black text-sm text-stone-900 shrink-0">
                              {q.questionNumber}.
                            </span>
                            <div className="text-stone-900 text-sm font-medium leading-relaxed">
                              {q.prompt}
                            </div>
                          </div>
                          <span className="font-mono font-bold text-xs text-stone-700 shrink-0">
                            [{q.marks} {q.marks === 1 ? 'mark' : 'marks'}]
                          </span>
                        </div>

                        {/* Multiple Choice Options if available */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                            {q.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className="p-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-xs text-stone-800 font-medium"
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Marking Guidance & Memo (Visible when toggled) */}
                        {showMarkingScheme && (
                          <div className="mt-3 ml-7 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2 animate-fadeIn">
                            <div className="flex items-center gap-1.5 font-display font-bold text-xs uppercase tracking-wider text-emerald-900">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Marking Memo & Rubric:</span>
                            </div>
                            {q.correctAnswer && (
                              <div className="text-xs text-emerald-950 font-medium">
                                <strong>Answer:</strong> {q.correctAnswer}
                              </div>
                            )}
                            {q.markingGuidance && (
                              <div className="text-xs text-emerald-900/90 leading-relaxed">
                                <strong>Guidance:</strong> {q.markingGuidance}
                              </div>
                            )}
                            {q.rubricCriteria && q.rubricCriteria.length > 0 && (
                              <ul className="list-disc list-inside text-xs text-emerald-800 space-y-0.5 pt-1">
                                {q.rubricCriteria.map((crit, cIdx) => (
                                  <li key={cIdx}>{crit}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Marking Notes */}
            {showMarkingScheme && exam.overallMarkingNotes && (
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="font-display font-black text-xs uppercase tracking-wider text-amber-900">
                  Moderator & Chief Examiner Notes
                </div>
                <p className="text-xs text-amber-950 leading-relaxed font-medium">
                  {exam.overallMarkingNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
